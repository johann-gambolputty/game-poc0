
using System;
using GameLib.World.Shared;
using GameLib.World;
using System.Collections.Generic;

namespace GameLib.World
{
    public interface IEntity
    {
        int Id { get; }

        IEntityType EntityType { get; }

        ISharedEntity ToShared();
    }


    public class Entity : IEntity
    {
        //private readonly List<IEntity> _assets = new List<IEntity>();

        public Entity(int id, IEntityType entityType)
        {
            Id = id;
            EntityType = entityType;
        }

        public IEntityType EntityType
        {
            get; private set;
        }

        public int Id
        {
            get; private set;
        }

        public ISharedEntity ToShared()
        {
            return new SharedEntity(Id, EntityType.Id);
        }
    }
}
