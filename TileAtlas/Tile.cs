using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace TileAtlas
{
    [Flags]
    enum CornerTransition
    {
        None        = 0x0,
        TopLeft     = 0x1,
        TopRight    = 0x2,
        BottomLeft  = 0x4,
        BottomRight = 0x8
    }

    [Flags]
    enum EdgeTransition
    {
        None        = 0x0,
        Top         = 0x1,
        Left        = 0x2,
        Right       = 0x4,
        Bottom      = 0x8
    }

    class TileInfo
    {
        public string Path { get; set; }
        public bool FlipHorizontal { get; set; }
        public bool FlipVertical { get; set; }
        public CornerTransition CornerTransition { get; set; }
        public EdgeTransition EdgeTransition { get; set; }
        public bool AutoTransition { get; set; }

        public Point Start { get; set; }

        public override bool Equals(object obj)
        {
            var other = obj as TileInfo;
            return other != null
                && other.Path == Path
                && other.FlipHorizontal == FlipHorizontal && other.FlipVertical == FlipVertical
                && other.EdgeTransition == EdgeTransition && other.CornerTransition == CornerTransition
                && other.AutoTransition == AutoTransition
                && other.Start == Start;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + Path.GetHashCode();
            hash = hash * 23 + (FlipHorizontal ? 1 : 0);
            hash = hash * 23 + (FlipVertical ? 1 : 0);
            hash = hash * 23 + CornerTransition.GetHashCode();
            hash = hash * 23 + EdgeTransition.GetHashCode();
            hash = hash * 23 + (AutoTransition ? 1 : 0);
            hash = hash * 23 + Start.GetHashCode();
            return hash;
        }

        internal IEnumerable<TileInfo> Split(Image image, int tileSize)
        {
            for (var y = 0; y < image.Height / tileSize; ++y)
            {
                for (var x = 0; x < image.Width / tileSize; ++x)
                {
                    yield return new TileInfo { Path = Path, Start = new Point(x * tileSize, y * tileSize) };
                }
            }
        }
    }


    /// <summary>
    /// Tile Set
    /// </summary>
    /// <remarks>
    /// Name: required, identifies the tile set transitional tiles
    /// Base tile: required, the main tile. Must be a multiple of default tile size. If > default tile size then it is split. If > default tile size it must have shared transitions
    /// Shared transition: indicates that the transitions come from another tile set
    /// [Nw/Ne/Se/Sw]CornerTilePath: Corner tile path. If prefixed with "{hflip}" the tile is flipped horizontally. If prefixed with "{vflip}" the tile is flipped vertically
    /// [N/S/E/W]EdgeTilePath: Edge tile path. If prefixed with "{hflip}" the tile is flipped horizontally. If prefixed with "{vflip}" the tile is flipped vertically
    /// 
    /// If no shared transition is specified, transitions are automatically created by combining the base tile with an opacity mask.
    /// </remarks>
    class TileSet
    {
        public TileSet()
        {
            EdgeTilePaths = new string[16];
            CornerTilePaths = new string[16];
        }

        public string Name { get; set; }
        public string BaseTilePath { get; set; }
        public string SharedTransitionWith { get; set; }
        public string[] EdgeTilePaths { get; private set; }
        public string[] CornerTilePaths { get; private set; }
        public bool GenerateTransitions { get; internal set; }

        public void SetEdgeTilePath(EdgeTransition transition, string path)
        {
            EdgeTilePaths[(int)transition] = path;
        }

        public void SetCornerTilePath(CornerTransition transition, string path)
        {
            CornerTilePaths[(int)transition] = path;
        }

        public IEnumerable<TileInfo> BaseTileInfos()
        {
            yield return new TileInfo { Path = BaseTilePath };
        }

        private IEnumerable<TileInfo> TransitionTileInfos(IDictionary<string, TileSet> tileSetsByName, Func<TileSet, int, TileInfo> createTileInfo)
        {
            var source = SharedTransitionWith == null ? this : tileSetsByName[SharedTransitionWith];
            return !GenerateTransitions? Enumerable.Empty<TileInfo>() : Enumerable.Range(1, 15).Select(i => createTileInfo(source, i));
        }

        public IEnumerable<TileInfo> CornerTransitionTileInfos(IDictionary<string, TileSet> tileSetsByName)
        {
            return TransitionTileInfos(tileSetsByName, (source, i) => CreateTileInfo(source, CornerTilePaths[i], EdgeTransition.None, (CornerTransition)i));
        }

        public IEnumerable<TileInfo> EdgeTransitionTileInfos(IDictionary<string, TileSet> tileSetsByName)
        {
            return TransitionTileInfos(tileSetsByName, (source, i) => CreateTileInfo(source, EdgeTilePaths[i], (EdgeTransition)i, CornerTransition.None));
        }

        public IEnumerable<TileInfo> AllTileInfos(IDictionary<string, TileSet> tileSetsByName)
        {
            return BaseTileInfos().Concat(CornerTransitionTileInfos(tileSetsByName)).Concat(EdgeTransitionTileInfos(tileSetsByName));
        }

        private TileInfo CreateTileInfo(TileSet sourceTileSet, string path, EdgeTransition edgeTransition, CornerTransition cornerTransition)
        {
            if (path == null)
            {
                return new TileInfo { Path = sourceTileSet.BaseTilePath, CornerTransition = cornerTransition, EdgeTransition = edgeTransition, AutoTransition = true };
            }
            bool flipHorizontal = false;
            bool flipVertical = false;
            if (path.Contains("{hflip}"))
            {
                path = path.Replace("{hflip}", "");
                flipHorizontal = true;
            }
            if (path.Contains("{vflip}"))
            {
                path = path.Replace("{vflip}", "");
                flipVertical = true;
            }
            return new TileInfo { Path = path, FlipHorizontal = flipHorizontal, FlipVertical = flipVertical, CornerTransition = cornerTransition, EdgeTransition = edgeTransition, AutoTransition = false };
        }
    }

    class Layer
    {
        public string Name { get; set; }
        public TileSet[] TileSets { get; set; }
    }

}
