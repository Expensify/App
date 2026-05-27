// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

/*
 * iOS uses UIAccessibilityLayoutChangedNotification (synchronous) — VoiceOver honours the first
 * call, so no race-mitigation re-fire is needed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scheduleRefocus(_view: View | RNText): {cancel: () => void} {
    return {cancel: () => {}};
}

export default scheduleRefocus;
