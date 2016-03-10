
using GameLib.Maths;

namespace GameLib.World.Shared
{


    public interface ISharedWorldSyncAction
    {
    }

    public class SharedWorldSyncActionAddEntity : ISharedWorldSyncAction
    {
        public int NewEntityId { get; set; }
        public int NewEntityTypeId { get; set; }

        public IntPoint3d Pos { get; set; }

        public double Facing { get; set; }
    }


    public class SharedWorldSyncActionMoveEntity : ISharedWorldSyncAction
    {
        public int EntityId { get; set; }

        public IntPoint3d Pos { get; set; }
        public double Facing { get; set; }
    }

    public class SharedWorldSyncAction : ISharedWorldSyncAction
    {
    }


    public class SharedWorldSyncActions
    {
        public SharedWorldSyncActionAddEntity[] AddActions { get; set; }
        public SharedWorldSyncActionMoveEntity[] MoveActions { get; set; }
    }

}
