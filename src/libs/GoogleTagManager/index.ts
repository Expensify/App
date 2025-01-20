/* eslint-disable @typescript-eslint/naming-convention */
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
    user_id: number;
};

declare const window: WindowWithDataLayer;

function publishEvent(event: GoogleTagManagerEvent, accountID: number) {
    if (!window.dataLayer) {
        return;
    }

    const params = {event, user_id: accountID};

    // Pass a copy of params here since the dataLayer modifies the object
    window.dataLayer.push({...params});

    Log.info('[GTM] event published', false, params);
}

const GoogleTagManager: GoogleTagManagerModule = {
    publishEvent,
};

export default GoogleTagManager;
