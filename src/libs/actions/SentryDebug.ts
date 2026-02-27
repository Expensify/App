import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Set whether Sentry debug mode is enabled
 * When enabled, Sentry requests are logged to console
 */
function setIsSentryDebugEnabled(isEnabled: boolean) {
    Onyx.set(ONYXKEYS.IS_SENTRY_DEBUG_ENABLED, isEnabled);
}

/**
 * Set the list of span operations to highlight in Sentry debug logs
 */
function setSentryDebugHighlightedSpanOps(spanOps: string[]) {
    Onyx.set(ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS, spanOps);
}

export {setIsSentryDebugEnabled, setSentryDebugHighlightedSpanOps};
