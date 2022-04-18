/**
 * This file helps bridge the Network layer with other parts of the app like API, NetworkConnection, PersistedRequestsQueue etc.
 * It helps avoid circular dependencies and by setting up event triggers and subscribers.
 */
import CONST from '../../CONST';
import EventBus from '../EventBus';

class NetworkEvents extends EventBus {
    constructor() {
        // This class is a singleton
        if (NetworkEvents.instance) {
            return NetworkEvents.instance;
        }
        super(CONST.NETWORK.EVENTS);
        NetworkEvents.instance = this;

        // eslint-disable-next-line no-console
        this.logger = {
            info: () => {},
            alert: () => {},
            warn: () => {},
            hmmm: () => {},

            // eslint-disable-next-line no-console
            client: console.log,
        };
        this.on(CONST.NETWORK.EVENTS.SETUP_LOG_HANDLER, logger => this.logger = logger);
    }

    startRecheckTimeoutTimer() {
        // If request is still in processing after this time, we might be offline
        const timerID = setTimeout(() => this.emit(CONST.NETWORK.EVENTS.RECHECK_CONNECTION), CONST.NETWORK.MAX_PENDING_TIME_MS);
        return () => clearTimeout(timerID);
    }
}

export default new NetworkEvents();
