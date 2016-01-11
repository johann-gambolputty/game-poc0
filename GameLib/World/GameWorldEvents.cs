
using GameLib.Maths;
using System;
using System.Reactive.Linq;
using System.Reactive.Subjects;

namespace GameLib.World
{
    public interface IGameWorldEvent
    {
        void Visit(IGameWorldEventVisitor visitor);
    }

    public interface IGameWorldEventVisitor
    {
        void Visit(GameWorldEventMoveTo evt);
        void Visit(GameWorldEventSay evt);
    }

    public class GameWorldEventMoveTo : IGameWorldEvent
    {
        public GameWorldEventMoveTo(IntPoint3d point)
        {
            Point = point;
        }

        public IntPoint3d Point { get; private set; }

        public void Visit(IGameWorldEventVisitor visitor)
        {
            visitor.Visit(this);
        }
    }

    public class GameWorldEventSay : IGameWorldEvent
    {
        public GameWorldEventSay(string text)
        {
            Text = text;
        }

        public string Text { get; private set; }

        public void Visit(IGameWorldEventVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
    
    public interface IGameWorldEvents
    {
        IObservable<IGameWorldEvent> All { get; }
        IObservable<GameWorldEventMoveTo> MoveTo { get; }
        IObservable<GameWorldEventSay> Say { get; }
    }

    public interface IGameWorldEventPublisher
    {
        void Publish(IGameWorldEvent evt);
    }

    public class GameWorldEvents : IGameWorldEvents, IGameWorldEventPublisher, IGameWorldEventVisitor
    {
        private readonly Subject<GameWorldEventMoveTo> _moveTo;
        private readonly Subject<GameWorldEventSay> _say;

        public GameWorldEvents()
        {
            _moveTo = new Subject<GameWorldEventMoveTo>();
            _say = new Subject<GameWorldEventSay>();
            All = Observable.Merge<IGameWorldEvent>(MoveTo, Say);
        }

        public IObservable<IGameWorldEvent> All { get; private set; }
        public IObservable<GameWorldEventMoveTo> MoveTo { get { return _moveTo; } }

        public IObservable<GameWorldEventSay> Say { get { return _say; } }

        public void Publish(IGameWorldEvent evt)
        {
            evt.Visit(this);
        }

        public void Visit(GameWorldEventMoveTo evt)
        {
            _moveTo.OnNext(evt);
        }

        public void Visit(GameWorldEventSay evt)
        {
            _say.OnNext(evt);
        }
    }
}
