
using NDesk.Options;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Drawing;
using System.Drawing.Imaging;
using Newtonsoft.Json;

namespace TileAtlas
{
    static class JTokenExtensions
    {
        public static T ValueOrDefault<T>(this JToken token, T defaultValue = default(T))
        {
            return token == null ? defaultValue : token.Value<T>();
        }

    }

    class Program
    {
        static bool IsValidImageSize(int size, int tileSize)
        {
            return size > 0 && (size % tileSize) == 0;
        }

        static bool IsPowerOfTwo(int x)
        {
            return ((x != 0) && ((x & (~x + 1)) == x));
        }

        static T ParseFlagEnum<T>(string s, Func<T, T, T> combine)
        {
            return s.Split('|').Select(token => (T)Enum.Parse(typeof(T), token)).Aggregate(default(T), combine);
        }

        static EdgeTransition ParseEdgeTransitions(string s)
        {
            return ParseFlagEnum<EdgeTransition>(s, (a, x) => a | x);
        }

        static CornerTransition ParseCornerTransitions(string s)
        {
            return ParseFlagEnum<CornerTransition>(s, (a, x) => a | x);
        }

        static void Main(string[] args)
        {
            string mapfile = null;
            bool prettyOutput = false;
            new OptionSet()
            {
                { "mapfile|mf=", v => mapfile = v },
                { "pretty|p", v => prettyOutput = true }
            }.Parse(args);
            if (mapfile == null)
            {
                Console.Error.WriteLine("No mapfile specified - please use --mapfile [file] or --mf [file]");
                return;
            }

            var tileSize = 32;
            var maxAtlasSize = 1024;
            var maxTileCount = (maxAtlasSize * maxAtlasSize) / (tileSize * tileSize);

            var map = JObject.Parse(File.ReadAllText(mapfile));
            var atlasName = map["atlasName"] == null ? "default" : map["atlasName"].Value<string>();
            var outputFile = "atlas-" + atlasName + ".png";
            var outputUvFile = "atlas-" + atlasName + "-uv.json";
            var tilesets = map["tileSets"].Children().Select(tilesetData =>
            {
                var tileset = new TileSet
                {
                    BaseTilePath = tilesetData["baseTilePath"].ValueOrDefault<string>(),
                    Name = tilesetData["name"].Value<string>(),
                    GenerateTransitions = tilesetData["generateTransitions"].ValueOrDefault(true)
                };
                if (tilesetData["edgeTransitions"] != null)
                {
                    foreach (var edgeTransition in tilesetData["edgeTransitions"].Children().Select(d => new { Transitions = ParseEdgeTransitions(d.Value<string>("for")), Path = d.Value<string>("path") }))
                    {
                        tileset.SetEdgeTilePath(edgeTransition.Transitions, edgeTransition.Path);
                    }
                }
                if (tilesetData["cornerTransitions"] != null)
                {
                    foreach (var cornerTransition in tilesetData["cornerTransitions"].Children().Select(d => new { Transitions = ParseCornerTransitions(d.Value<string>("for")), Path = d.Value<string>("path") }))
                    {
                        tileset.SetCornerTilePath(cornerTransition.Transitions, cornerTransition.Path);
                    }
                }
                return tileset;
            }).ToArray();
            var tempFiles = new List<string>();
            try
            {
                //  Create a dictionary of all the named tile sets. These are used to resolve shared transitions
                var namedTileSetMap = tilesets.Where(ts => !string.IsNullOrEmpty(ts.Name)).ToDictionary(ts => ts.Name);

                //  Store all the distinct tile infos in a single flat array for convenience
                var allTileInfos = tilesets.SelectMany(tileSet => tileSet.AllTileInfos(namedTileSetMap)).Distinct().ToArray();

                //  Load all the distinct images in parallel and form them into a dictionary
                var imgMap = allTileInfos.Select(info => info.Path).Distinct()
                    .AsParallel()
                    .Select((path, index) =>
                    {
                        var uri = Uri.IsWellFormedUriString(path, UriKind.Absolute) ? new Uri(path) : new Uri(Path.GetFullPath(path));
                        var localPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(uri.LocalPath) + "-" + index);
                        if (string.IsNullOrEmpty(Path.GetExtension(uri.LocalPath)))
                        {
                            localPath = localPath + ".png"; //  Add default extension (for piskel files)
                        }
                        else
                        {
                            localPath = localPath + Path.GetExtension(uri.LocalPath);
                        }
                        if (File.Exists(localPath))
                        {
                            File.Delete(localPath);
                        }
                        using (WebClient client = new WebClient())
                        {
                            client.Headers["Accept"] = "image/*";
                            client.DownloadFile(uri, localPath);
                        }
                        lock (tempFiles)
                        {
                            tempFiles.Add(localPath);
                        }
                        using (var stream = new FileStream(localPath, FileMode.Open, FileAccess.Read))
                        {
                            var result = new { LocalPath = path, Image = Image.FromStream(stream) };
                            if (!IsValidImageSize(result.Image.Width, tileSize))
                            {
                                throw new InvalidDataException(string.Format("Image '{0}' had an invalid width (should be evenly divisible by {1} but was {2})", path, tileSize, result.Image.Width));
                            }
                            if (!IsValidImageSize(result.Image.Height, tileSize))
                            {
                                throw new InvalidDataException(string.Format("Image '{0}' had an invalid height (should be evenly divisible by {1} but was {2})", path, tileSize, result.Image.Height));
                            }
                            return result;
                        }
                    }).ToDictionary(i => i.LocalPath, i => i.Image);

                //  Now that the images are loaded, we can work out how big each tile is. Most should be default (32x32) but larger 2^x tiles are possible. These are split into multiple default size tiles
                //  The difference with large tiles is that they do not have transitions. They MUST use shared transitions.
                //  e.g. { "name": "LargeSwimmingPool", "baseTilePath": "swimming-pool-64x64.png", "shareTransitionsWith": "Patio" }
                //  This effectively becomes {"name:"LargeSwimmingPool-0", "baseTilePath": "swimming-pool-64x64.png", "start": { x: 0, y: 0 }, "shareTransitionsWith": "Patio" }, ...
                var tileInfosWithDefaultSize = (from tileInfo in allTileInfos let img = imgMap[tileInfo.Path] where img.Width == tileSize && img.Height == tileSize select tileInfo).ToArray();
                var processedTileInfos = tileInfosWithDefaultSize.Concat(allTileInfos.Except(tileInfosWithDefaultSize).SelectMany(tileInfo => tileInfo.Split(imgMap[tileInfo.Path], tileSize)));

                int totalTileCount = 1 + (from tileInfo in allTileInfos let img = imgMap[tileInfo.Path] select (img.Width * img.Height) / (tileSize * tileSize)).Sum();
                if (totalTileCount > maxTileCount)
                {
                    throw new InvalidDataException(string.Format("Too many tiles ({0}) - Maximum tile count of {1} was exceeded", totalTileCount, maxTileCount));
                }
                var atlasWidth = Math.Min(totalTileCount * tileSize, maxAtlasSize);
                var atlasTileWidth = atlasWidth / tileSize;
                var atlasHeight = (((totalTileCount * tileSize) / atlasWidth) + 1) * tileSize;   //  TODO: Round up instead of +1
                Console.WriteLine("Processing {0} unique images, forming {1} unique tiles in the atlas. Atlas size: ({2}, {3})", imgMap.Count, totalTileCount, atlasWidth, atlasHeight);

                //  Now let's work out where each tile goes
                var tileUvMap = allTileInfos.Select((tileInfo, index) => new { TileInfo = tileInfo, Uv = new Point(tileSize * ((index + 1) % atlasTileWidth), tileSize * ((index + 1) / atlasTileWidth)) }).ToDictionary(i => i.TileInfo, i => i.Uv);
                
                //  Render the tile atlas
                var bmp = new Bitmap(atlasWidth, atlasHeight, PixelFormat.Format32bppArgb);
                var g = Graphics.FromImage(bmp);
                foreach (var tileInfo in processedTileInfos)
                {
                    var uvInfo = tileUvMap[tileInfo];
                    var img = imgMap[tileInfo.Path];
                    if (tileInfo.AutoTransition)
                    {
                        img = AutoTransition.CreateAutoTransitionImage(img, tileSize, tileInfo.EdgeTransition, tileInfo.CornerTransition, 6, 13);
                    }
                    g.DrawImage(img, uvInfo.X, uvInfo.Y);
                }
                bmp.Save(outputFile);

                //  Next write out the UVs of all tiles of all layers - this is the atlas UV lookup data dump
                var root = new JObject(
                    new JProperty("tileSize", tileSize),
                    new JProperty("tileSets", new JArray(tilesets.Select(ts => TileSetToJson(ts, namedTileSetMap, tileUvMap))))
                );
                File.WriteAllText(outputUvFile, root.ToString(prettyOutput ? Formatting.Indented: Formatting.None));

            }
            finally
            {
                lock (tempFiles)
                {
                    foreach (var tempFile in tempFiles)
                    {
                        File.Delete(tempFile);
                    }
                }
            }
        }

        private static JObject TileInfoToJson(TileInfo tileInfo, IDictionary<TileInfo, Point> tileUvMap)
        {
            var tileUv = tileUvMap[tileInfo];
            var obj = new JObject(
                new JProperty("u", tileUv.X),
                new JProperty("v", tileUv.Y)
            );
            if (tileInfo.CornerTransition != CornerTransition.None)
            {
                obj.Add(new JProperty("tbits", tileInfo.CornerTransition));
            }
            if (tileInfo.EdgeTransition != EdgeTransition.None)
            {
                obj.Add(new JProperty("tbits", tileInfo.EdgeTransition));
            }
            return obj;
        }

        private static JObject TileSetToJson(TileSet tileSet, IDictionary<string, TileSet> tileSetsByName, IDictionary<TileInfo, Point> tileUvMap)
        {
            var baseTileInfo = tileSet.BaseTileInfos().First();
            return new JObject(
                new JProperty("name", tileSet.Name),
                new JProperty("baseTileInfo", TileInfoToJson(baseTileInfo, tileUvMap)),
                new JProperty("cornerTransitionTileInfos", new JArray(tileSet.CornerTransitionTileInfos(tileSetsByName).Select(tileInfo => TileInfoToJson(tileInfo, tileUvMap)))),
                new JProperty("edgeTransitionTileInfos", new JArray(tileSet.EdgeTransitionTileInfos(tileSetsByName).Select(tileInfo => TileInfoToJson(tileInfo, tileUvMap))))
            );
        }
        
    }
}
