import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Network} from '@src/types/onyx';

/**
 * Selector for network data that returns essential network status information
 */
const networkStatusSelector = (networkData: OnyxEntry<Network>) => {
    if (!networkData) {
        return {...CONST.DEFAULT_NETWORK_DATA, networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN};
    }

    return {
        isOffline: networkData.isOffline,
        networkStatus: networkData.networkStatus,
        lastOfflineAt: networkData.lastOfflineAt,
    };
};

// eslint-disable-next-line import/prefer-default-export
export {networkStatusSelector};
