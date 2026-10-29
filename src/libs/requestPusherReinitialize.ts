import Log from './Log';

type PusherReinitializeHandlerParams = {
    accountID?: number;
    email?: string;
};

type PusherReinitializeHandler = (params?: PusherReinitializeHandlerParams) => Promise<void>;

let registeredHandler: PusherReinitializeHandler | null = null;

function registerPusherReinitializeHandler(handler: PusherReinitializeHandler | null) {
    registeredHandler = handler;
}

function requestPusherReinitialize(params?: PusherReinitializeHandlerParams): Promise<void> {
    if (!registeredHandler) {
        Log.warn('[requestPusherReinitialize] No handler registered, skipping Pusher reinitialization', {params});
        return Promise.resolve();
    }

    return registeredHandler(params);
}

export {registerPusherReinitializeHandler, requestPusherReinitialize};
export type {PusherReinitializeHandlerParams};
