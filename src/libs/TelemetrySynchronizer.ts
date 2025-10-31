/**
 * This file contains the logic for sending additional data to Sentry.
 *
 * It uses Onyx.connectWithoutView as nothing here is related to the UI. We only send data to external provider and want to keep this outside of the render loop.
 */
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';
import FS from './Fullstory';

/**
 * Connect to FullStory to retrieve session id from it. We want to link FullStory with Sentry for easier debugging.
 */
FS.onReady().then(async () => {
    const sessionId = await FS.getSessionId();
    if (!sessionId) {
        return;
    }
    Sentry.setContext(CONST.TELEMETRY.CONTEXT_FULLSTORY, {sessionId});
});
