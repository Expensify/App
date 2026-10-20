// DEBUG ONLY: temporary instrumentation for an ad hoc build, sent to both server logs and Sentry.
import Log from '@libs/Log';

import * as Sentry from '@sentry/react-native';

type WalletDebugParams = Record<string, unknown>;

/** True only while the MFA context is synchronously inside its call to the scenario action. */
const walletDebugState = {isDispatchingAction: false};

/** Short call stack, so frame depth shows whether a continuation ran synchronously or from a promise job. */
function getWalletDebugStack() {
    return new Error('stack probe').stack?.split('\n').slice(1, 16).join(' | ');
}

function walletDebugLog(message: string, shouldSendNow: boolean, params: WalletDebugParams) {
    Log.info(`[WalletDebug] ${message}`, shouldSendNow, params);
    Sentry.addBreadcrumb({category: 'wallet-debug', message: `[WalletDebug] ${message}`, level: 'info', data: params});
}

/** Creates a Sentry event so the full breadcrumb trail, including native iOS breadcrumbs, is uploaded. */
function walletDebugCapture(message: string, params: WalletDebugParams) {
    Sentry.captureMessage(`[WalletDebug] ${message}`, {level: 'warning', tags: {walletDebug: 'true'}, extra: params});
}

export {walletDebugLog, walletDebugCapture, walletDebugState, getWalletDebugStack};
