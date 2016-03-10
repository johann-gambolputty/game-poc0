
using GameLib.World.Shared;
using System.Collections.Generic;
using System.Linq;

namespace GameLib.World
{
    public class GameWorld
    {
        private readonly Dictionary<int, IEntity> _entities = new Dictionary<int, IEntity>();

        public void AddEntity(IEntity entity)
        {
            _entities.Add(entity.Id, entity);
        }

        public void RemoveEntityById(int id)
        {
            _entities.Remove(id);
        }


        public ISharedWorldFrame TakeSharedSnapshot()
        {
            return new SharedWorldFrame(_entities.Values.Select(entity => entity.ToShared()));
        }
    }
}
