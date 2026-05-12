import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsSentryDebugEnabled(isEnabled: boolean) {
    Onyx.set(ONYXKEYS.IS_SENTRY_DEBUG_ENABLED, isEnabled);
}

function setIsSentrySendEnabled(isEnabled: boolean) {
    Onyx.set(ONYXKEYS.IS_SENTRY_SEND_ENABLED, isEnabled);
}

function setSentryDebugHighlightedSpanOps(spanOps: string[]) {
    Onyx.set(ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS, spanOps);
}

export {setIsSentryDebugEnabled, setIsSentrySendEnabled, setSentryDebugHighlightedSpanOps};
