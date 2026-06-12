import type {OnyxKey} from 'react-native-onyx';
import Log from '@libs/Log';
import {isSupportAuthToken} from '@libs/Network/NetworkStore';
import {showSupportalPermissionDenied} from '@userActions/App';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type Middleware from './types';

/**
 * Middleware that detects when a support token attempts an unauthorized command
 * and triggers a global modal while preventing retries for that request.
 */
const SupportalPermission: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        const message = response?.message;
        const isUnauthorizedSupportalAction =
            isSupportAuthToken() && response?.jsonCode === 411 && typeof message === 'string' && message.includes('You are not authorized to take this action when support logged in.');

        if (isUnauthorizedSupportalAction) {
            if (request?.data) {
                request.data.shouldRetry = false;
            }

            const command = request?.command ?? 'unknown';
            Log.info('Supportal insufficient permissions; suppressing retry', false, {command});
            showSupportalPermissionDenied({
                command,
            });
        }

        return response;
    });

export default SupportalPermission;
