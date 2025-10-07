// Making an exception to this rule here since we don't need an "action" for Log and Log should just be used directly. Creating a Log
// action would likely cause confusion about which one to use. But most other API methods should happen inside an action file.

/* eslint-disable rulesdir/no-api-in-views */
import {Logger} from 'expensify-common';
import AppLogs from 'react-native-app-logs';
import Onyx from 'react-native-onyx';
import type {Merge} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import pkg from '../../package.json';
import {addLog, flushAllLogsOnAppLaunch} from './actions/Console';
import {shouldAttachLog} from './Console';
import getPlatform from './getPlatform';
import {post} from './Network';
import requireParameters from './requireParameters';

let shouldCollectLogs = false;

// Batch system for log transmission
type PendingLogRequest = {
    parameters: LogCommandParameters;
    resolve: (value: {requestID: string}) => void;
    reject: (error: Error) => void;
    timestamp: number;
};

let logBatch: PendingLogRequest[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
const BATCH_SEND_INTERVAL = 30 * 1000; // 30 seconds
const MAX_BATCH_SIZE = 50; // Maximum logs per batch
const MAX_BATCH_AGE = 60 * 1000; // Maximum age for a log in batch (60 seconds)

Onyx.connectWithoutView({
    key: ONYXKEYS.SHOULD_STORE_LOGS,
    callback: (val) => {
        if (!val) {
            shouldCollectLogs = false;
        }

        shouldCollectLogs = !!val;
    },
});

type LogCommandParameters = {
    expensifyCashAppVersion: string;
    logPacket: string;
};

function LogCommand(parameters: LogCommandParameters): Promise<{requestID: string}> {
    const commandName = 'Log';
    requireParameters(['logPacket', 'expensifyCashAppVersion'], parameters, commandName);

    // Note: We are forcing Log to run since it requires no authToken and should only be queued when we are offline.
    // Non-cancellable request: during logout, when requests are cancelled, we don't want to cancel any remaining logs
    return post(commandName, {...parameters, forceNetworkRequest: true, canCancel: false}) as Promise<{requestID: string}>;
}

/**
 * Send all batched logs to the server and resolve pending promises
 */
function sendBatchedLogs(): Promise<void> {
    if (logBatch.length === 0) {
        return Promise.resolve();
    }

    // Take all current logs from the batch
    const currentBatch = logBatch;
    logBatch = [];

    // Combine all log packets into one
    const combinedLogPackets = currentBatch.map(item => item.parameters.logPacket).join('\n');
    const batchParameters: LogCommandParameters = {
        logPacket: combinedLogPackets,
        expensifyCashAppVersion: currentBatch.at(0)?.parameters.expensifyCashAppVersion ?? `expensifyCash[${getPlatform()}]${pkg.version}`,
    };

    // Send the combined logs and resolve/reject all pending promises
    return LogCommand(batchParameters)
        .then((response) => {
            // Resolve all pending log requests with the server's request ID
            currentBatch.forEach((item) => {
                item.resolve(response);
            });
        })
        .catch((error: unknown) => {
            console.debug('[Log] Failed to send batched logs:', error);
            // Reject all pending log requests with the error
            const errorObj = error instanceof Error ? error : new Error(String(error));
            currentBatch.forEach((item) => {
                item.reject(errorObj);
            });
        });
}

/**
 * Flush batched logs immediately
 */
function flushBatchedLogs(): Promise<void> {
    if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }
    return sendBatchedLogs();
}

/**
 * Start the batch timer if not already running
 */
function startBatchTimer(): void {
    if (batchTimer) {
        return;
    }

    batchTimer = setTimeout(() => {
        sendBatchedLogs().then(() => {
            batchTimer = null;
            
            // Restart timer if there are more logs in the batch
            if (logBatch.length > 0) {
                startBatchTimer();
            }
        });
    }, BATCH_SEND_INTERVAL);
}

/**
 * Add log parameters to the batch and return a promise that resolves with the actual request ID
 */
function addToBatch(parameters: LogCommandParameters): Promise<{requestID: string}> {
    return new Promise((resolve, reject) => {
        logBatch.push({
            parameters,
            resolve,
            reject,
            timestamp: Date.now(),
        });

        // Check if we should send the batch immediately
        const shouldFlushImmediately = 
            logBatch.length >= MAX_BATCH_SIZE || 
            (logBatch.length > 0 && Date.now() - (logBatch.at(0)?.timestamp ?? Date.now()) > MAX_BATCH_AGE);

        if (shouldFlushImmediately) {
            flushBatchedLogs();
        } else {
            startBatchTimer();
        }
    });
}

// eslint-disable-next-line
type ServerLoggingCallbackOptions = {api_setCookie: boolean; logPacket: string};
type RequestParams = Merge<ServerLoggingCallbackOptions, {shouldProcessImmediately: boolean; shouldRetry: boolean; expensifyCashAppVersion: string; parameters: string}>;

/**
 * Network interface for logger.
 * Now properly returns the actual request ID from the server after batching.
 */
function serverLoggingCallback(logger: Logger, params: ServerLoggingCallbackOptions): Promise<{requestID: string}> {
    const requestParams = params as RequestParams;
    requestParams.shouldProcessImmediately = false;
    requestParams.shouldRetry = false;
    requestParams.expensifyCashAppVersion = `expensifyCash[${getPlatform()}]${pkg.version}`;
    if (requestParams.parameters) {
        requestParams.parameters = JSON.stringify(requestParams.parameters);
    }
    
    // Add log to batch and return the promise that will resolve with the actual request ID
    const batchParams: LogCommandParameters = {
        logPacket: params.logPacket,
        expensifyCashAppVersion: requestParams.expensifyCashAppVersion,
    };
    
    // Return the promise from addToBatch which will resolve when the batch is sent
    return addToBatch(batchParams);
}

// Note: We are importing Logger from expensify-common because it is used by other platforms. The server and client logging
// callback methods are passed in here so we can decouple the logging library from the logging methods.
const Log = new Logger({
    serverLoggingCallback,
    clientLoggingCallback: (message, extraData) => {
        if (!shouldAttachLog(message)) {
            return;
        }

        flushAllLogsOnAppLaunch().then(() => {
            console.debug(message, extraData);
            if (shouldCollectLogs) {
                addLog({time: new Date(), level: CONST.DEBUG_CONSOLE.LEVELS.DEBUG, message, extraData});
            }
        });
    },
    maxLogLinesBeforeFlush: 150,
    isDebug: true,
});

AppLogs.configure({appGroupName: 'group.com.expensify.new', interval: -1});
AppLogs.registerHandler({
    filter: '[NotificationService]',
    handler: ({filter, logs}) => {
        logs.forEach((log) => {
            // Both native and JS logs are captured by the filter so we replace the filter before logging to avoid an infinite loop
            const message = `[PushNotification] ${log.message.replace(filter, 'NotificationService -')}`;

            if (log.level === 'error') {
                Log.hmmm(message);
            } else {
                Log.info(message);
            }
        });
    },
});

export default Log;
