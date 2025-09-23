import Log from '@libs/Log';
import {isSupportAuthToken} from '@libs/Network/NetworkStore';
import {showSupportalPermissionDenied} from '@userActions/App';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type Middleware from './types';

/**
 * Middleware that detects when a support token attempts an unauthorized command
 * and triggers a global modal while preventing retries for that request.
 */
const SupportalPermission: Middleware = (responsePromise: Promise<Response | void>, request: Request) =>
    responsePromise.then((response) => {
        const res = response as Response | undefined;
        const message = res?.message;
        const isUnauthorizedSupportalAction =
            isSupportAuthToken() && res?.jsonCode === 411 && typeof message === 'string' && message.includes('You are not authorized to take this action when support logged in.');

        if (isUnauthorizedSupportalAction) {
            if (request?.data) {
                request.data.shouldRetry = false;
            }

            Log.info('Supportal insufficient permissions; suppressing retry', false, {command: request.command});
            showSupportalPermissionDenied({
                command: request.command,
            });
        }

        return response;
    });

export default SupportalPermission;
