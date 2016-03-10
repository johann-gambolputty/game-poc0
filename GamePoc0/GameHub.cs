using GameLib.World;
using GamePoc0.Game;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Reactive.Linq;
using System.Reactive.Subjects;

namespace GamePoc0
{
    [HubName("gameHub")]
    public class GameHub : Hub
    {
        private readonly GameHubPublisher _publisher;
        private readonly GameWorld _world;

        public GameHub()
        {
            _world = new GameWorld();
            _world.AddEntity(new Entity(0, new EntityType(0)));
            _world.AddEntity(new Entity(1, new EntityType(1)));
            _world.AddEntity(new Entity(2, new EntityType(1)));
            _publisher = new GameHubPublisher(this);

            Observable.Timer(TimeSpan.FromSeconds(1), TimeSpan.FromMilliseconds(50)).Subscribe(_ => {
                _publisher.Publish(_world);
            }
            );
        }

        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastMessage(name, message);
            //_publisher.Publish(_world);
        }
    }
}