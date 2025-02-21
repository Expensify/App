/**
 * This file contains a simple Node.js websocket server that is used to broadcast a reload event to connected clients.
 * It enables our email preview application to hot-reload.
 */
import open from 'open';
import WebSocket from 'ws';
import CONFIG from './CONFIG';

class LiveReloadServer {
    public static readonly URL = `ws://localhost:${CONFIG.LIVE_RELOAD_PORT}`;
    public static readonly EVENT_RELOAD = 'reload';

    /**
     * These are IDs for "websocket subprotocols", which is a fancy way of saying
     * there are two types of websocket clients that can connect to this server:
     *   - controllers (which can issue a command to trigger a live reload)
     *   - consumers (which can receive a command to reload)
     */
    public static readonly PROTOCOL_CONTROLLER = 'live-reload-controller';
    public static readonly PROTOCOL_CONSUMER = 'live-reload-consumer';

    /**
     * The script that can be embedded in a webpage to register a live reload consumer
     */
    public static readonly clientConnectionScript = `
        <script>
            const ws = new WebSocket('${this.URL}', '${this.PROTOCOL_CONSUMER}');
            ws.onmessage = (message) => {
                const event = JSON.parse(message.data.toString());
                if (event.type !== '${this.EVENT_RELOAD}') {
                    return;
                }
                console.log('🔄 Received reload event, refreshing page...');
                location.reload();
            };
        </script>
    `;

    private server: WebSocket.Server;
    private consumerClients: Set<WebSocket> = new Set();

    public constructor() {
        this.server = new WebSocket.Server({port: CONFIG.LIVE_RELOAD_PORT});
    }

    /**
     * Start the live reload websocket server
     */
    public start = () => {
        this.server.on('connection', (ws) => {
            const clientType = ws.protocol;
            if (clientType === LiveReloadServer.PROTOCOL_CONTROLLER) {
                this.registerController(ws);
            } else if (clientType === LiveReloadServer.PROTOCOL_CONSUMER) {
                this.registerConsumer(ws);
            } else {
                console.log(`😕 Unsupported client type ${clientType}`);
                ws.close();
            }
        });
        console.log(`📡 LiveReloadServer started on ${LiveReloadServer.URL}`);
    };

    /**
     * Create a live reload controller client, connect to the live reload server,
     * and send a reload event to trigger a refresh of all connected consumer clients.
     */
    public static trigger = (url: string) => {
        console.log('🚀 Triggering live reload of connected consumers');
        const wsClient = new WebSocket(this.URL, this.PROTOCOL_CONTROLLER);
        wsClient.on('open', () => {
            console.log('📡 Connected controller to LiveReloadServer, sending reload command...');
            wsClient.send(JSON.stringify({type: this.EVENT_RELOAD, url}));
            wsClient.close();
        });
        wsClient.on('error', (err) => {
            console.error('⚠️ Could not connect to LiveReload server:', err.message);
        });
    };

    /**
     * Setup the websocket server to broadcast events to consumers when a command is received from a controller.
     */
    private registerController = (ws: WebSocket) => {
        ws.on('message', (message) => {
            const event = JSON.parse(message.toString());
            if (event.type !== LiveReloadServer.EVENT_RELOAD) {
                return;
            }

            console.log('🫡 Received reload command from controller');
            if (this.consumerClients.size === 0) {
                console.log(`💻 No consumer clients connected, opening ${event.url} in the browser`);
                open(event.url);
            } else {
                console.log(`🔄 Broadcasting reload event to ${this.consumerClients.size} connected consumers...`);
                for (const client of this.consumerClients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({type: LiveReloadServer.EVENT_RELOAD}));
                    }
                }
            }
        });
    };

    /**
     * Keep track of consumers so that we can refresh them as needed.
     */
    private registerConsumer = (ws: WebSocket) => {
        console.log(`🍽️  Registering consumer`);
        this.consumerClients.add(ws);
        ws.on('close', () => {
            console.log('🗑️  Deleting consumer');
            this.consumerClients.delete(ws);
        });
    };
}

export default LiveReloadServer;
