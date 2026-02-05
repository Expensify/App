// Making an exception to this rule here since we don't need an "action" for Log and Log should just be used directly. Creating a Log
// action would likely cause confusion about which one to use. But most other API methods should happen inside an action file.
/* eslint-disable rulesdir/no-api-in-views */
import HybridAppModule from '@expensify/react-native-hybrid-app';
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
import {getCurrentUserEmail} from './Network/NetworkStore';
import requireParameters from './requireParameters';
import forwardLogsToSentry from './telemetry/forwardLogsToSentry';

let timeout: NodeJS.Timeout;
let shouldCollectLogs = false;

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

// eslint-disable-next-line
type ServerLoggingCallbackOptions = {api_setCookie: boolean; logPacket: string};
type RequestParams = Merge<
    ServerLoggingCallbackOptions,
    {shouldProcessImmediately: boolean; shouldRetry: boolean; expensifyCashAppVersion: string; parameters?: string; email?: string | null}
>;

type LogLine = {email?: string | null; [key: string]: unknown};

/**
 * Network interface for logger.
 * Splits log packets by email to ensure logs are attributed to the correct user,
 * even when multiple users' logs are queued before flushing.
 */
function serverLoggingCallback(logger: Logger, params: ServerLoggingCallbackOptions): Promise<{requestID: string}> {
    const baseParams = {
        shouldProcessImmediately: false,
        shouldRetry: false,
        expensifyCashAppVersion: `expensifyCash[${getPlatform()}]${pkg.version}`,
    };

    // Parse log lines and group by email to handle multi-user scenarios
    // (e.g., user signs out and another signs in before logs flush)
    const logLines = JSON.parse(params.logPacket) as LogLine[];
    const logsByEmail = new Map<string | null, LogLine[]>();
    for (const line of logLines) {
        const email = line.email ?? null;
        const existing = logsByEmail.get(email) ?? [];
        existing.push(line);
        logsByEmail.set(email, existing);
    }

    // Create a request for each email group
    const requests: Array<Promise<{requestID: string}>> = [];
    for (const [email, lines] of logsByEmail) {
        const requestParams: RequestParams = {
            ...params,
            ...baseParams,
            logPacket: JSON.stringify(lines),
            email,
        };

        if (requestParams.parameters) {
            requestParams.parameters = JSON.stringify(requestParams.parameters);
        }

        requests.push(LogCommand(requestParams));
    }

    // Mirror backend log payload into Telemetry logger for better context
    forwardLogsToSentry(params.logPacket);
    clearTimeout(timeout);
    timeout = setTimeout(() => logger.info('Flushing logs older than 10 minutes', true, {}, true), 10 * 60 * 1000);

    // Return the first request's result (all requests will be sent in parallel)
    return Promise.all(requests).then((results) => results.at(0) ?? {requestID: ''});
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
    getContextEmail: getCurrentUserEmail,
});
timeout = setTimeout(() => Log.info('Flushing logs older than 10 minutes', true, {}, true), 10 * 60 * 1000);

// eslint-disable-next-line no-restricted-properties
const appGroupName = HybridAppModule.isHybridApp() ? 'group.com.expensify' : 'group.com.expensify.new';
AppLogs.configure({appGroupName, interval: -1});
AppLogs.registerHandler({
    filter: '[NotificationService]',
    handler: ({filter, logs}) => {
        for (const log of logs) {
            // Both native and JS logs are captured by the filter so we replace the filter before logging to avoid an infinite loop
            const message = `[PushNotification] ${log.message.replace(filter, 'NotificationService -')}`;

            if (log.level === 'error') {
                Log.hmmm(message);
            } else {
                Log.info(message);
            }
        }
    },
});

export default Log;
