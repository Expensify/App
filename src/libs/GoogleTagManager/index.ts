/* eslint-disable @typescript-eslint/naming-convention */
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {GoogleTagManagerEvent} from './types';
import type GoogleTagManagerModule from './types';

/**
 * The dataLayer is added with a js snippet from Google in web/thirdPartyScripts.js. Set USE_THIRD_PARTY_SCRIPTS to true
 * in your .env to enable this
 */
type WindowWithPixels = Window & {
    dataLayer?: {
        push: (params: DataLayerPushParams) => void;
    };
    fbq?: (method: string, eventName: string, params?: Record<string, unknown>, options?: Record<string, unknown>) => void;
    rdt?: (method: string, eventType: string, params?: Record<string, string>) => void;
    lintrk?: (method: string, params: Record<string, unknown>) => void;
};

type DataLayerPushParams = {
    event: GoogleTagManagerEvent;
    user_id: number;
    user_data: {email: string};
};

declare const window: WindowWithPixels;

const PIXEL_EVENTS = [CONST.ANALYTICS.EVENT.SIGN_UP, CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, CONST.ANALYTICS.EVENT.PAID_ADOPTION] as const;

function publishEvent(event: GoogleTagManagerEvent, accountID: number, email: string) {
    if (!window.dataLayer) {
        return;
    }

    const params = {event, user_id: accountID, user_data: {email}};

    // Pass a copy of params here since the dataLayer modifies the object
    window.dataLayer.push({...params});

    Log.info('[GTM] event published', false, params);

    const pixelEvent = PIXEL_EVENTS.find((e) => e.NAME === event);
    if (!pixelEvent) {
        return;
    }

    const eventID = `${accountID}-${event}`;

    // Meta
    if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', pixelEvent.META, {em: email}, {eventID});
    }

    // Reddit
    if (typeof window.rdt === 'function') {
        window.rdt('track', pixelEvent.REDDIT, {
            conversionId: eventID,
            email,
        });
    }

    // LinkedIn (uses numeric conversion IDs instead of named events)
    if (typeof window.lintrk === 'function') {
        window.lintrk('setUserData', {email});
        window.lintrk('track', {conversion_id: pixelEvent.LINKEDIN, event_id: eventID});
    }
}

const GoogleTagManager: GoogleTagManagerModule = {
    publishEvent,
};

export default GoogleTagManager;
