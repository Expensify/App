/* eslint-disable @typescript-eslint/naming-convention */
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import Log from '@libs/Log';
import type {GoogleTagManagerEvent} from './types';
import type GoogleTagManagerModule from './types';

const analytics = getAnalytics();

function publishEvent(event: GoogleTagManagerEvent, accountID: number) {
    logEvent(analytics, event as string, {user_id: accountID});
    Log.info('[GTM] event published', false, {event, user_id: accountID});
}

const GoogleTagManager: GoogleTagManagerModule = {
    publishEvent,
};

export default GoogleTagManager;
