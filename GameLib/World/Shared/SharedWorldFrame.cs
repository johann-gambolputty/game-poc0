

using System;
using System.Collections.Generic;
using System.Linq;

namespace GameLib.World.Shared
{
    public interface ISharedWorldFrame
    {
        IReadOnlyDictionary<int, ISharedEntity> Entities { get; }

        SharedWorldSyncActions ToActions();

        SharedWorldSyncActions ToActions(ISharedWorldFrame baseline);
    }

    public class SharedWorldFrame : ISharedWorldFrame
    {
        private readonly Dictionary<int, ISharedEntity> _entities;
        private readonly int _scaleFactor;

        public SharedWorldFrame(IEnumerable<ISharedEntity> entities, int scaleFactor)
        {
            _entities = entities.ToDictionary(entity => entity.Id);
            _scaleFactor = scaleFactor;
        }

        public IReadOnlyDictionary<int, ISharedEntity> Entities { get { return _entities; } }

        public SharedWorldSyncActions ToActions()
        {
            return ToActions(new SharedWorldFrame(Enumerable.Empty<ISharedEntity>(), _scaleFactor));
        }

        public SharedWorldSyncActions ToActions(ISharedWorldFrame baseline)
        {
            var realBaseline = baseline ?? new SharedWorldFrame(Enumerable.Empty<ISharedEntity>(), _scaleFactor);
            return new SharedWorldSyncActions
            {
                ScaleFactor = _scaleFactor,
                AddActions = _entities.Values.Where(entity => !realBaseline.Entities.ContainsKey(entity.Id)).Select(entity => new SharedWorldSyncActionAddEntity { NewEntityId = entity.Id, NewEntityTypeId = entity.TypeId }).ToArray(),
                MoveActions = _entities.Values.Where(entity => HasMovedFromBaseline(entity, realBaseline)).Select(entity => new SharedWorldSyncActionMoveEntity { EntityId = entity.Id, Pos = entity.Position }).ToArray()
            };
        }

        private bool HasMovedFromBaseline(ISharedEntity entity, ISharedWorldFrame baseline)
        {
            ISharedEntity baselineEntity;
            return baseline.Entities.TryGetValue(entity.Id, out baselineEntity) && entity.Position != baselineEntity.Position;
        }
    }
}
