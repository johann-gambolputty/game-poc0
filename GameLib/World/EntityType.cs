
using System;

namespace GameLib.World
{
    public interface IEntityType
    {
        int Id { get; }
    }


    public class EntityType : IEntityType
    {
        public EntityType(int id)
        {
            Id = id;
        }

        public int Id
        {
            get; private set;
        }
    }
}
