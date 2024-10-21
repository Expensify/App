import Log from '@libs/Log';
import type {GoogleTagManagerEvent} from './types';
import type GoogleTagManagerModule from './types';

/**
 * The dataLayer is added with a js snippet from Google in web/thirdPartyScripts.js
 */
type WindowWithDataLayer = Window & {
    dataLayer: {
        push: (params: DataLayerPushParams) => void;
    };
};

type DataLayerPushParams = {
    event: GoogleTagManagerEvent;
    accountID: number;
};

declare const window: WindowWithDataLayer;

function publishEvent(event: GoogleTagManagerEvent, accountID: number) {
    window.dataLayer.push({event, accountID});
    Log.info('[GTM] event published', false, {event, accountID});
}

const GoogleTagManager: GoogleTagManagerModule = {
    publishEvent,
};

export default GoogleTagManager;
