import {addMiddleware} from '@libs/Request';

import {
    FailureTracking,
    FraudMonitoring,
    handleDeletedAccount,
    HandleMovedScanFailedExpenses,
    HandleUnusedOptimisticID,
    LoadPostDataForOpenOrReconnect,
    LoadTest,
    Logging,
    Pagination,
    Reauthentication,
    RecordFullReconnectTime,
    SaveResponseInOnyx,
    SentryServerTiming,
    SupportalPermission,
} from './index';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next.
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.
//
// This lives here rather than in libs/API because six of the middlewares below import user actions, and every
// user action imports libs/API. Registering from inside libs/API therefore closes an import cycle: libs/API
// imports Middleware, Middleware imports an action, and that action imports libs/API again. Instead the
// composition root calls this explicitly, before anything can call processWithMiddleware: see src/setup/index.ts.
let hasRegistered = false;

function registerMiddlewares() {
    if (hasRegistered) {
        return;
    }
    hasRegistered = true;

    // Logging - Logs request details and errors.
    addMiddleware(Logging);

    // Duplicates API calls (tagged with mockRequest=true) when the server sends load-test parameters via the X-Load-Test response header.
    addMiddleware(LoadTest);

    // FailureTracking - Observes request outcomes and feeds them to FailureTracker for sustained failure detection.
    addMiddleware(FailureTracking);

    // Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
    addMiddleware(Reauthentication);

    // Handles the case when the copilot has been deleted. The response contains jsonCode 408 and a message indicating account deletion
    addMiddleware(handleDeletedAccount);

    // Handle supportal permission denial centrally
    addMiddleware(SupportalPermission);

    // If an optimistic ID is not used by the server, this will update the remaining serialized requests using that optimistic ID to use the correct ID instead.
    addMiddleware(HandleUnusedOptimisticID);

    addMiddleware(Pagination);

    // SentryServerTiming - Tracks server round-trip time for configured command groups via Sentry spans.
    addMiddleware(SentryServerTiming);

    // RecordFullReconnectTime - Records the full-reconnect time into an OpenApp/full-ReconnectApp response. Must run before SaveResponseInOnyx applies the response.
    addMiddleware(RecordFullReconnectTime);

    // LoadPostDataForOpenOrReconnect - Sends the reads that OpenApp/ReconnectApp does not return, once per response that reaches the server.
    addMiddleware(LoadPostDataForOpenOrReconnect);

    // HandleMovedScanFailedExpenses - Retires the optimistic report built for scan-failed expenses moved on payment once the backend answers
    // with the report it created for them. Must run before SaveResponseInOnyx so its updates are applied with the response.
    addMiddleware(HandleMovedScanFailedExpenses);

    // SaveResponseInOnyx - Merges either the successData or failureData (or finallyData, if included in place of the former two values) into Onyx depending on if the call was successful or not. This must be the last middleware that applies Onyx data
    // (middlewares after it, like FraudMonitoring, must not write Onyx), because the SequentialQueue depends on the result of this middleware to pause the queue (if needed) to bring the app to an up-to-date state.
    addMiddleware(SaveResponseInOnyx);

    // FraudMonitoring - Tags the request with the appropriate Fraud Protection event.
    addMiddleware(FraudMonitoring);
}

export default registerMiddlewares;
