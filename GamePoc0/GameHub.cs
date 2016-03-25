using GameLib.Maths;
using GameLib.World;
using GameLib.World.Shared;
using GameLib.World.Traits;
using GamePoc0.Game;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Reactive.Linq;

namespace GamePoc0
{
    [HubName("gameHub")]
    public class GameHub : Hub
    {
        private readonly GameHubPublisher _publisher;
        private readonly GameWorld _world;

        public GameHub()
        {
            var playerType = new EntityType(0).WithTrait(_ => new LeaderTrait());
            var followerType = new EntityType(1).WithTrait(e => new FlockingTrait(e));

            _world = new GameWorld();
            _world.AddEntity(new Entity(0, playerType) { Pos = _world.ToIntVector3d(new Vector3d(20, 0, 20)) });
            _world.AddEntity(new Entity(1, followerType) { Pos = _world.ToIntVector3d(new Vector3d(30, 0, 20)) });
            _world.AddEntity(new Entity(2, followerType) { Pos = _world.ToIntVector3d(new Vector3d(40, 0, 20)) });
            _publisher = new GameHubPublisher(this);

            Observable.Timer(TimeSpan.FromSeconds(1), TimeSpan.FromMilliseconds(50)).Subscribe(_ => {
                //  TODO: Use input parameter to determine time since last update?
                _world.Update(50);
                _publisher.Publish(_world);
            });
        }

        public void HandleUserAction(ISharedWorldSyncAction action)
        {
            Console.WriteLine(action);
        }

        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastMessage(name, message);
            //_publisher.Publish(_world);
        }
    }
}