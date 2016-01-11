using System;
using System.Drawing;
using System.Drawing.Imaging;

namespace TileAtlas
{
    class AutoTransition
    {

        public static Image CreateAutoTransitionImage(Image img, int tileSize, EdgeTransition edgeTransition, CornerTransition cornerTransition, float innerRadius, float outerRadius)
        {
            var alphaFunc = GetTransitionAlphaFunc(edgeTransition, cornerTransition, tileSize, innerRadius, outerRadius, (float)(255.0 / (outerRadius - innerRadius)));

            using (var sourceBmp = new Bitmap(img))
            {
                var bitLock = sourceBmp.LockBits(new Rectangle(0, 0, img.Width, img.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                try
                {
                    float _255OverRadiusDiff = 255.0f / (outerRadius - innerRadius);
                    unsafe
                    {
                        byte* srcImg = (byte*)bitLock.Scan0.ToPointer();
                        byte[] destData = new byte[img.Width * img.Height * 4];
                        int offset = 0;
                        fixed (byte* dstImg = &destData[0])
                        {
                            for (var y = 0; y < img.Height; ++y)
                            {
                                for (var x = 0; x < img.Width; ++x, offset += 4)
                                {
                                    dstImg[offset + 0] = srcImg[offset + 0];
                                    dstImg[offset + 1] = srcImg[offset + 1];
                                    dstImg[offset + 2] = srcImg[offset + 2];
                                    dstImg[offset + 3] = alphaFunc(x, y);
                                }
                            }
                            return new Bitmap(img.Width, img.Height, img.Width * 4, PixelFormat.Format32bppArgb, (IntPtr)dstImg);
                        }
                    }
                }
                finally
                {
                    sourceBmp.UnlockBits(bitLock);
                }
            }

        }

        private static Func<int, int, byte> GetTransitionAlphaFunc(EdgeTransition edgeTransition, CornerTransition cornerTransition, int tileSize, float innerRadius, float outerRadius, float _255OverRadiusDiff)
        {
            if (edgeTransition != EdgeTransition.None)
            {
                return GetEdgeOpacityAlphaFunc((byte)edgeTransition, tileSize, innerRadius, outerRadius, _255OverRadiusDiff);
            }
            if (cornerTransition != CornerTransition.None)
            {
                return GetCornerOpacityAlphaFunc((byte)cornerTransition, tileSize, innerRadius, outerRadius, _255OverRadiusDiff);
            }
            return (x, y) => 1;
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
    }
}
