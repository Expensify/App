import {WRITE_COMMANDS} from './API/types';

/**
 * One of these API requests is executed on every app startup.
 * We measure the duration from native app startup (before JS runtime is loaded)
 * to the completion of this request and send the span to Sentry.
 */
const APP_STARTUP_NETWORK_REQUEST = new Set<string>([WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP]);

function isStartupNetworkRequest(command?: string): boolean {
    return !!command && APP_STARTUP_NETWORK_REQUEST.has(command);
}

export default isStartupNetworkRequest;
