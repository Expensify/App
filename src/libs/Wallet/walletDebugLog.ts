// DEBUG ONLY: temporary instrumentation for an ad hoc build, sent to both server logs and Sentry.
import Log from '@libs/Log';

import * as Sentry from '@sentry/react-native';

type WalletDebugParams = Record<string, unknown>;

function walletDebugLog(message: string, shouldSendNow: boolean, params: WalletDebugParams) {
    Log.info(`[WalletDebug] ${message}`, shouldSendNow, params);
    Sentry.addBreadcrumb({category: 'wallet-debug', message: `[WalletDebug] ${message}`, level: 'info', data: params});
}

/** Creates a Sentry event so the full breadcrumb trail, including native iOS breadcrumbs, is uploaded. */
function walletDebugCapture(message: string, params: WalletDebugParams) {
    Sentry.captureMessage(`[WalletDebug] ${message}`, {level: 'warning', tags: {walletDebug: 'true'}, extra: params});
}

export {walletDebugLog, walletDebugCapture};
