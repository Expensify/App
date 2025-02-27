/* eslint-disable @typescript-eslint/naming-convention */
import analytics from '@react-native-firebase/analytics';
import Log from '@libs/Log';
import type {GoogleTagManagerEvent} from './types';
import type GoogleTagManagerModule from './types';

function publishEvent(event: GoogleTagManagerEvent, accountID: number) {
    analytics().logEvent(event, {user_id: accountID});
    Log.info('[GTM] event published', false, {event, user_id: accountID});
}

const GoogleTagManager: GoogleTagManagerModule = {
    publishEvent,
};

export default GoogleTagManager;
