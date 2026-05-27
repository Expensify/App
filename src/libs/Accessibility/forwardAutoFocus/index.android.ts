// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';
import fireFocusEvent from '@libs/Accessibility/fireFocusEvent';
// eslint-disable-next-line no-restricted-imports -- focus-return is a sibling primitive to TransitionTracker; the exact transitionEnd signal is what we need.
import TransitionTracker from '@libs/Navigation/TransitionTracker';
// eslint-disable-next-line no-restricted-imports -- this is android-only code; the rule guards web bundles from pulling the native node-handle stub.
import findNodeHandle from '@src/utils/findNodeHandle';
import Accessibility from '..';

let registeredBackButton: View | RNText | null = null;

function notifyBackButtonMounted(view: View | RNText | null): void {
    registeredBackButton = view;
}

function scheduleForwardAutoFocus(): void {
    if (!Accessibility.isScreenReaderEnabledSync()) {
        return;
    }
    TransitionTracker.runAfterTransitions({
        callback: () => {
            const view = registeredBackButton;
            if (!view || findNodeHandle(view) == null) {
                return;
            }
            fireFocusEvent(view);
        },
    });
}

export {notifyBackButtonMounted, scheduleForwardAutoFocus};
