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
    return registeredHandler?.(params) ?? Promise.resolve();
}

export {registerPusherReinitializeHandler, requestPusherReinitialize};
export type {PusherReinitializeHandlerParams};
