
using GameLib.Maths;
using GameLib.Utils;
using GameLib.World.Shared;
using GameLib.World.Traits;
using System;
using System.Collections.Generic;
using System.Linq;

namespace GameLib.World
{
    public interface ISpatialQuery
    {
        T Visit<T>(ISpatialQueryVisitor<T> visitor);
    }

    public class InSphereSpatialQuery : ISpatialQuery
    {
        public InSphereSpatialQuery(IntVector3d centre, float radius)
        {
            Centre = centre;
            RadiusSqr = radius * radius;
        }
        public IntVector3d Centre { get; private set; }
        public float RadiusSqr { get; private set; }

        public T Visit<T>(ISpatialQueryVisitor<T> visitor)
        {
            return visitor.Visit(this);
        }
    }

    public interface ISpatialQueryVisitor<T>
    {
        T Visit(InSphereSpatialQuery query);
    }
    

    public class GameWorld
    {
        private readonly Dictionary<int, IEntity> _entities = new Dictionary<int, IEntity>();

        private class EntitySpatialQueryVisitor : ISpatialQueryVisitor<IEnumerable<IEntity>>
        {
            private readonly IEnumerable<IEntity> _entities;

            public EntitySpatialQueryVisitor(IEnumerable<IEntity> entities)
            {
                _entities = entities;
            }

            public IEnumerable<IEntity> Visit(InSphereSpatialQuery query)
            {
                var result = _entities.Where(entity => (entity.Pos - query.Centre).SqrLength() < query.RadiusSqr).ToArray();
                return result;
            }
        }
       
        public IEnumerable<IEntity> EntitySpatialQuery(ISpatialQuery query)
        {
            return query.Visit(new EntitySpatialQueryVisitor(_entities.Values));
        }

        public Maybe<IEntity> FirstEntity(Func<IEntity, bool> predicate)
        {
            return _entities.Values.FirstOrDefault(predicate).ToMaybe();
        }

        public void AddEntity(IEntity entity)
        {
            _entities.Add(entity.Id, entity);
        }

        public void RemoveEntityById(int id)
        {
            _entities.Remove(id);
        }

        public void Update()
        {
            foreach (var trait in _entities.Values.SelectMany(entity => entity.Traits.AllTraitsOfType<IUpdatingTrait>()))
            {
                trait.Update(this);
            }
        }

        public ISharedWorldFrame TakeSharedSnapshot()
        {
            return new SharedWorldFrame(_entities.Values.Select(entity => entity.ToShared()));
        }

    }
}
