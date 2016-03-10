
using GameLib.Maths;
using GameLib.World.Shared;

namespace GameLib.World
{
    public interface IEntity
    {
        int Id { get; }

        IEntityType EntityType { get; }

        IntPoint3d Pos { get; set; }

        double Facing { get; set; }

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

        public IntPoint3d Pos { get; set; }

        public double Facing { get; set; }

        public ISharedEntity ToShared()
        {
            return new SharedEntity(Id, EntityType.Id) { Position = Pos };
        }
    }
}
