
using GameLib.World.Traits;
using System;

namespace GameLib.World
{
    public interface IEntityType
    {
        int Id { get; }

        TraitContainerTemplate DefaultTraits { get; }
        
    }


    public class EntityType : IEntityType
    {
        public EntityType(int id)
        {
            Id = id;
            DefaultTraits = new TraitContainerTemplate();
        }

        public EntityType WithTrait<T>(Func<IEntity, T> traitFactory) where T : ITrait
        {
            DefaultTraits.AddTrait(e => traitFactory(e));
            return this;
        }

        public int Id { get; private set; }

        public TraitContainerTemplate DefaultTraits { get; private set; }
        
    }
}
