
using System;

namespace GameLib.World
{
    public class GameWorldController
    {
        private readonly IGameWorldSimulator _simulator;
        private readonly GameWorld _world;
        private readonly IGameWorldPublisher _publisher;
        
        public GameWorldController(GameWorld world, Func<GameWorld, IGameWorldSimulator> simulatorFactory, IGameWorldPublisher publisher)
        {
            _world = world;
            _simulator = simulatorFactory(world);
            _publisher = publisher;
        }

        public void Update()
        {
            _simulator.Step();
            _publisher.Publish(_world);
        }
    }
}
