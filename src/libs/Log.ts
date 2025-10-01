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
let logBatch: LogCommandParameters[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
const BATCH_SEND_INTERVAL = 30 * 1000; // 30 seconds

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
 * Send all batched logs to the server
 */
function sendBatchedLogs(): void {
    if (logBatch.length === 0) {
        return;
    }


    // Combine all log packets into one
    const combinedLogPackets = logBatch.map(params => params.logPacket).join('\n');
    const batchParameters: LogCommandParameters = {
        logPacket: combinedLogPackets,
        expensifyCashAppVersion: logBatch.at(0)?.expensifyCashAppVersion ?? `expensifyCash[${getPlatform()}]${pkg.version}`, // Use the first one's version info
    };

    // Clear the batch
    logBatch = [];

    // Send the combined logs
    LogCommand(batchParameters).catch((error) => {
        console.debug('Failed to send batched logs:', error);
    });
}

/**
 * Start the batch timer if not already running
 */
function startBatchTimer(): void {
    if (batchTimer) {
        return;
    }

    batchTimer = setTimeout(() => {
        sendBatchedLogs();
        batchTimer = null;
        
        // Restart timer if there are more logs in the batch
        if (logBatch.length > 0) {
            startBatchTimer();
        }
    }, BATCH_SEND_INTERVAL);
}

/**
 * Add log parameters to the batch
 */
function addToBatch(parameters: LogCommandParameters): void {
    logBatch.push(parameters);
    startBatchTimer();
}

// eslint-disable-next-line
type ServerLoggingCallbackOptions = {api_setCookie: boolean; logPacket: string};
type RequestParams = Merge<ServerLoggingCallbackOptions, {shouldProcessImmediately: boolean; shouldRetry: boolean; expensifyCashAppVersion: string; parameters: string}>;

/**
 * Network interface for logger.
 */
function serverLoggingCallback(logger: Logger, params: ServerLoggingCallbackOptions): Promise<{requestID: string}> {
    const requestParams = params as RequestParams;
    requestParams.shouldProcessImmediately = false;
    requestParams.shouldRetry = false;
    requestParams.expensifyCashAppVersion = `expensifyCash[${getPlatform()}]${pkg.version}`;
    if (requestParams.parameters) {
        requestParams.parameters = JSON.stringify(requestParams.parameters);
    }
    
    // Add all logs to batch
    const batchParams: LogCommandParameters = {
        logPacket: params.logPacket,
        expensifyCashAppVersion: requestParams.expensifyCashAppVersion,
    };
    
    addToBatch(batchParams);
    
    // Return immediately with a generated request ID
    return Promise.resolve({requestID: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`});
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
