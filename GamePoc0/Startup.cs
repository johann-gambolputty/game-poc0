using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(GamePoc0.Startup))]

namespace GamePoc0
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            //GlobalHost.DependencyResolver.Register(typeof(I;
            app.MapSignalR();
        }
    }
}
