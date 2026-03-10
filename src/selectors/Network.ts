import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Network} from '@src/types/onyx';

const networkStatusSelector = (networkData: OnyxEntry<Network>) => {
    if (!networkData) {
        return {...CONST.DEFAULT_NETWORK_DATA};
    }

    return {
        isOffline: networkData.isOffline,
        lastOfflineAt: networkData.lastOfflineAt,
    };
};

const shouldFailAllRequestsSelector = (network: OnyxEntry<Network>) => !!network?.shouldFailAllRequests;

export {networkStatusSelector, shouldFailAllRequestsSelector};
