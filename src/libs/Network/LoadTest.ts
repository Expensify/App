import type {OnyxKey} from 'react-native-onyx';
import HttpUtils from '@libs/HttpUtils';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import enhanceParameters from './enhanceParameters';
import {getDuplicateRequestCount} from './LoadTestState';

/**
 * Fires N-1 duplicate API calls marked with mockRequest=true so the server can identify them as load-test traffic.
 * The marker is sent as a form parameter (not a header) to avoid triggering CORS preflight requests for cross-origin
 * traffic. Bypasses the middleware pipeline so duplicates do not apply Onyx updates or recurse.
 */
function triggerDuplicates<TKey extends OnyxKey>(request: Request<TKey> | PaginatedRequest<TKey>): void {
    const count = getDuplicateRequestCount();
    if (count === 0) {
        return;
    }

    const finalParameters = enhanceParameters(request.command, {
        ...(request.data ?? {}),
        mockRequest: true,
    });

    for (let i = 0; i < count; i++) {
        HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure, request.initiatedOffline).catch(() => {
            // Load-test mock traffic is fire-and-forget; failures should not affect the app.
        });
    }
}

export {getDuplicateRequestCount, setLoadTestParameters} from './LoadTestState';
export {triggerDuplicates};
