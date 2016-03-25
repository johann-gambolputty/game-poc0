
using System;
using GameLib.Maths;

namespace GameLib.World.Shared
{
    public interface ISharedWorldSyncActionVisitor
    {
        void Visit(SharedWorldSyncActionAddEntity action);
        void Visit(SharedWorldSyncActionMoveEntity action);
    }

    public interface ISharedWorldSyncAction
    {
        void Visit(ISharedWorldSyncActionVisitor visitor);
    }
    
    public class SharedWorldSyncActionAddEntity : ISharedWorldSyncAction
    {
        public int NewEntityId { get; set; }
        public int NewEntityTypeId { get; set; }

        public IntVector3d Pos { get; set; }

        public double Facing { get; set; }

        public void Visit(ISharedWorldSyncActionVisitor visitor)
        {
            visitor.Visit(this);
        }
    }


    public class SharedWorldSyncActionMoveEntity : ISharedWorldSyncAction
    {
        public int EntityId { get; set; }

        public IntVector3d Pos { get; set; }
        public double Facing { get; set; }

        public void Visit(ISharedWorldSyncActionVisitor visitor)
        {
            visitor.Visit(this);
        }
    }


    public class SharedWorldSyncActions
    {
        public int ScaleFactor { get; set; }
        public SharedWorldSyncActionAddEntity[] AddActions { get; set; }
        public SharedWorldSyncActionMoveEntity[] MoveActions { get; set; }
    }

}
