﻿
using System;
using GameLib.Maths;

namespace GameLib.World.Shared
{
    public interface ISharedEntity
    {
        int Id { get; }
        IntPoint3d Position { get; }
        int TypeId { get; }
    }

    public class SharedEntity : ISharedEntity
    {
        public SharedEntity(int id, int typeId)
        {
            Id = id;
            TypeId = typeId;
        }

        public int Id { get; private set; }

        public IntPoint3d Position { get; set; }

        public int TypeId
        {
            get; private set;
        }
    }
}
