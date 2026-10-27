import CONST from '@src/CONST';

import type {EmbeddedWisePageCallbacks} from './types';

/** Calls the callback for a message Wise's embedded page posted. Native bridges pass the message as a JSON string, web as an object. */
function handleWiseFlowMessage(data: unknown, callbacks: EmbeddedWisePageCallbacks) {
    let message = data;
    if (typeof data === 'string') {
        try {
            message = JSON.parse(data);
        } catch {
            return;
        }
    }
    if (typeof message !== 'object' || message === null || !('type' in message)) {
        return;
    }

    switch (message.type) {
        case CONST.WISE_EMBEDDED_FLOW.MESSAGE_TYPE.READY:
            callbacks.onReady();
            break;
        case CONST.WISE_EMBEDDED_FLOW.MESSAGE_TYPE.DONE:
            callbacks.onDone();
            break;
        case CONST.WISE_EMBEDDED_FLOW.MESSAGE_TYPE.ERROR:
            if ('code' in message && message.code === CONST.WISE_EMBEDDED_FLOW.ERROR_CODE_CANCELLED) {
                callbacks.onCancel();
                break;
            }
            callbacks.onError();
            break;
        default:
            // `resize` is ignored because the page always fills the screen
            break;
    }
}

/**
 * Handles Wise's redirect fallback, which sends the page to our redirect URL with `?status=` instead of posting a message.
 * Returns true when the URL was that redirect, so the caller stops the navigation.
 */
function handleWiseRedirect(url: string, callbacks: EmbeddedWisePageCallbacks): boolean {
    const [pathAndQuery] = url.split('#');
    const [path, query = ''] = pathAndQuery.split('?');
    if (!path.endsWith(`/${CONST.WISE_EMBEDDED_FLOW.REDIRECT_PATH}`)) {
        return false;
    }

    const status = query
        .split('&')
        .map((pair) => pair.split('='))
        .find(([key]) => key === 'status')?.[1];
    if (status === CONST.WISE_EMBEDDED_FLOW.REDIRECT_STATUS.SUCCESS) {
        callbacks.onDone();
    } else if (status === CONST.WISE_EMBEDDED_FLOW.REDIRECT_STATUS.CANCELLED) {
        callbacks.onCancel();
    } else {
        callbacks.onError();
    }
    return true;
}

export {handleWiseFlowMessage, handleWiseRedirect};
