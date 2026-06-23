type PusherReinitializeHandler = () => Promise<void>;

let registeredHandler: PusherReinitializeHandler | null = null;

function registerPusherReinitializeHandler(handler: PusherReinitializeHandler | null) {
    registeredHandler = handler;
}

function requestPusherReinitialize(): Promise<void> {
    return registeredHandler?.() ?? Promise.resolve();
}

export {registerPusherReinitializeHandler, requestPusherReinitialize};
export type {PusherReinitializeHandler};
