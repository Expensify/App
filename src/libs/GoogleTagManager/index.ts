import Log from '@libs/Log';
import type {GoogleTagManagerEvent} from './types';
import type GoogleTagManagerModule from './types';

/**
 * The dataLayer is added with a js snippet from Google in web/thirdPartyScripts.js. Set USE_THIRD_PARTY_SCRIPTS to true
 * in your .env to enable this
 */
type WindowWithDataLayer = Window & {
    dataLayer?: {
        push: (params: DataLayerPushParams) => void;
    };
};

type DataLayerPushParams = {
    event: GoogleTagManagerEvent;
    accountID: number;
};

declare const window: WindowWithDataLayer;

function publishEvent(event: GoogleTagManagerEvent, accountID: number) {
    if (!window.dataLayer) {
        return;
    }

    window.dataLayer.push({event, accountID});
    Log.info('[GTM] event published', false, {event, accountID});
}

const GoogleTagManager: GoogleTagManagerModule = {
    publishEvent,
};

export default GoogleTagManager;
