using System;
using System.Drawing;
using System.Drawing.Imaging;

namespace TileOpacityMaskGenerator
{
    class Program
    {
        static int NextPowerOf2(int v)
        {
            v--;
            v |= v >> 1;
            v |= v >> 2;
            v |= v >> 4;
            v |= v >> 8;
            v |= v >> 16;
            return v + 1;
        }

        static void Main(string[] args)
        {
            var tileSize = 64;
            var fullWidth = NextPowerOf2((tileSize + 2) * 16);
            var fullHeight = NextPowerOf2((tileSize + 2) * 2);
            var data = new byte[fullWidth * fullHeight * 3];
            var cy = 1;
            var ey = tileSize + 8;
            float innerRadius = 3;
            float outerRadius = 10;
            float _255OverRadiusDiff = 255.0f / (outerRadius - innerRadius);
            for (var i = 1; i < 16; ++i)
            {
                var cx = i * (tileSize + 8);
                RenderOpacityMap(data, tileSize, cx, cy, fullWidth, GetCornerOpacityAlphaFunc((byte)i, tileSize, innerRadius, outerRadius, _255OverRadiusDiff));
                RenderOpacityMap(data, tileSize, cx, ey, fullWidth, GetEdgeOpacityAlphaFunc((byte)i, tileSize, innerRadius, outerRadius, _255OverRadiusDiff));
            }
            unsafe
            {
                fixed (byte* ptr = &data[0])
                {
                    var bmp = new Bitmap(fullWidth, fullHeight, fullWidth * 3, PixelFormat.Format24bppRgb, (IntPtr)ptr);
                    bmp.Save("tile-opacity-map.png", ImageFormat.Png);
                }
            }
        }

        private static byte AlphaFromDistance(float dist, float innerRadius, float outerRadius, float _255OverRadiusDiff)
        {
            return dist < innerRadius ? (byte)255 : (dist > outerRadius ? (byte)0 : (byte)(255 - ((dist - innerRadius) * _255OverRadiusDiff)));
        }

        private static float Dist(float x, float y, float ex, float ey)
        {
            var dx = ex - x;
            var dy = ey - y;
            return (float)Math.Sqrt(dx * dx + dy * dy);
        }
        
        private static Func<int, int, byte> GetCornerOpacityAlphaFunc(byte mask, int tileSize, float innerRadius, float outerRadius, float _255OverRadiusDiff)
        {
            return (x, y) =>
            {
                var alpha = 0;
                var x2 = x * x;
                var dx2 = (tileSize - x) * (tileSize - x);
                var y2 = y * y;
                var dy2 = (tileSize - y) * (tileSize - y);
                if ((mask & 1) != 0)
                {
                    alpha = AlphaFromDistance((float)Math.Sqrt(x2 + y2), innerRadius, outerRadius, _255OverRadiusDiff);
                }
                if ((mask & 2) != 0)
                {
                    alpha = Math.Max(alpha, AlphaFromDistance((float)Math.Sqrt(dx2 + y2), innerRadius, outerRadius, _255OverRadiusDiff));
                }
                if ((mask & 4) != 0)
                {
                    alpha = Math.Max(alpha, AlphaFromDistance((float)Math.Sqrt(dx2 + dy2), innerRadius, outerRadius, _255OverRadiusDiff));
                }
                if ((mask & 8) != 0)
                {
                    alpha = Math.Max(alpha, AlphaFromDistance((float)Math.Sqrt(x2 + dy2), innerRadius, outerRadius, _255OverRadiusDiff));
                }
                return (byte)alpha;
            };
        }

        private static Func<int, int, byte> GetEdgeOpacityAlphaFunc(byte mask, int tileSize, float innerRadius, float outerRadius, float _255OverRadiusDiff)
        {
            return (x, y) =>
            {
                var alpha = 0;
                var t = innerRadius + outerRadius;
                var mt = tileSize - t;
                if ((mask & 1) != 0)
                {
                    alpha = AlphaFromDistance(x, innerRadius, outerRadius, _255OverRadiusDiff);
                    if ((mask & 2) != 0 && x < t && y < t)
                    {
                        alpha = Math.Max(alpha, 255 - AlphaFromDistance(Dist(x, y, t, t), innerRadius, outerRadius, _255OverRadiusDiff));
                    }
                }
                if ((mask & 2) != 0)
                {
                    alpha = Math.Max(alpha, AlphaFromDistance(y, innerRadius, outerRadius, _255OverRadiusDiff));
                    if ((mask & 4) != 0 && x > mt && y < t)
                    {
                        alpha = Math.Max(alpha, 255 - AlphaFromDistance(Dist(x, y, mt, t), innerRadius, outerRadius, _255OverRadiusDiff));
                    }
                }
                if ((mask & 4) != 0)
                {
                    alpha = Math.Max(alpha, AlphaFromDistance(tileSize - x, innerRadius, outerRadius, _255OverRadiusDiff));
                    if ((mask & 8) != 0 && x > mt && y > mt)
                    {
                        alpha = Math.Max(alpha, 255 - AlphaFromDistance(Dist(x, y, mt, mt), innerRadius, outerRadius, _255OverRadiusDiff));
                    }
                }
                if ((mask & 8) != 0)
                {
                    alpha = Math.Max(alpha, AlphaFromDistance(tileSize - y, innerRadius, outerRadius, _255OverRadiusDiff));
                    if ((mask & 1) != 0 && x < t && y > mt)
                    {
                        alpha = Math.Max(alpha, 255 - AlphaFromDistance(Dist(x, y, t, mt), innerRadius, outerRadius, _255OverRadiusDiff));
                    }
                }
                return (byte)alpha;
            };
        }

        private static int Clamp(int val, int min, int max)
        {
            return val < min ? min : val > max ? max : val;
        }

        private static void RenderOpacityMap(byte[] data, int tileSize, int cx, int cy, int nextRowStep, Func<int, int, byte> alphaFunc)
        {
            for (var y = -1; y < tileSize + 1; ++y)
            {
                var idx = ((cx - 1) + (cy + y) * nextRowStep) * 3;
                for (var x = -1; x < tileSize + 1; ++x, idx += 3)
                {
                    var alpha = alphaFunc(Clamp(x, 0, tileSize), Clamp(y, 0, tileSize));
                    data[idx + 0] = alpha;
                    data[idx + 1] = alpha;
                    data[idx + 2] = alpha;
                }
            }
        }
    }
}
