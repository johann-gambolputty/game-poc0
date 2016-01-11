
using System;

namespace GameLib.Maths
{
    public struct IntPoint3d : IEquatable<IntPoint3d>
    {
        public readonly int X;
        public readonly int Y;
        public readonly int Z;

        public IntPoint3d(int x, int y, int z)
        {
            X = x;
            Y = y;
            Z = z;
        }

        public static bool operator !=(IntPoint3d lhs, IntPoint3d rhs)
        {
            return !lhs.Equals(rhs);
        }

        public static bool operator ==(IntPoint3d lhs, IntPoint3d rhs)
        {
            return lhs.Equals(rhs);
        }

        public override bool Equals(object obj)
        {
            return obj is IntPoint3d && Equals((IntPoint3d)obj);
        }
        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public bool Equals(IntPoint3d other)
        {
            return X == other.X && Y == other.Y && Z == other.Z;
        }
    }
}
