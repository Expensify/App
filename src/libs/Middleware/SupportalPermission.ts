import Log from '@libs/Log';
import isUnauthorizedSupportalResponse from '@libs/Network/isUnauthorizedSupportalResponse';

import {showSupportalPermissionDenied} from '@userActions/App';

import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import type Middleware from './types';

/**
 * Middleware that detects when a support token attempts an unauthorized command
 * and triggers a global modal while preventing retries for that request.
 */
const SupportalPermission: Middleware = <TKey extends OnyxKey>(responsePromise: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>) =>
    responsePromise.then((response) => {
        if (isUnauthorizedSupportalResponse(response)) {
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
