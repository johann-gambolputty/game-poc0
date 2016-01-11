using Microsoft.AspNet.SignalR;

namespace GamePoc0
{
    public class ChatHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }
    }
}