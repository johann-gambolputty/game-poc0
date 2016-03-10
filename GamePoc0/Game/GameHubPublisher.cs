using GameLib.World;
using GameLib.World.Shared;
using Microsoft.AspNet.SignalR;

namespace GamePoc0.Game
{
    public class GameHubPublisher : IGameWorldPublisher
    {
        private readonly Hub _hub;
        private ISharedWorldFrame _lastPublishedSnapshot;

        public GameHubPublisher(Hub hub)
        {
            _hub = hub;
        }

        public void Publish(GameWorld world)
        {
            var snapshot = world.TakeSharedSnapshot();
            var actions = snapshot.ToActions(_lastPublishedSnapshot);
            _hub.Clients.All.worldUpdate(actions);
            _lastPublishedSnapshot = snapshot;
        }
    }
}