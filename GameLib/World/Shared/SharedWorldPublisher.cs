
namespace GameLib.World.Shared
{
    public class SharedWorldPublisher : IGameWorldPublisher
    {
        private ISharedWorldFrame _lastPublishedSnapshot;

        public void Publish(GameWorld world)
        {
            var snapshot = world.TakeSharedSnapshot();
            snapshot.ToActions(_lastPublishedSnapshot);

            _lastPublishedSnapshot = snapshot;
        }
    }
}
