import captureRequestsQueueState from './requestsQueue';
import type {GlobalStateSnapshot} from './types';

function captureAppState(): GlobalStateSnapshot {
    return {
        navigation: captureNavigationState(),
        session: captureSessionState(),
        network: captureNetworkState(),
        requestQueues: captureRequestsQueueState(),
    };
}

export default captureAppState;
