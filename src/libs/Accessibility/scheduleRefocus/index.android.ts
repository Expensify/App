import fireFocusEvent from '@libs/Accessibility/fireFocusEvent';

import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

/*
 * TalkBack's auto-focus on TYPE_WINDOW_STATE_CHANGED clobbers the first event; re-fire when the
 * thread next idles (300ms hard cap). See facebook/react-native#30097.
 */
const REFOCUS_TIMEOUT_MS = 300;

function scheduleRefocus(ref: RefObject<View | RNText | null>): {cancel: () => void} {
    const id = requestIdleCallback(
        () => {
            const view = ref.current;
            if (!view) {
                return;
            }
            fireFocusEvent(view);
        },
        {timeout: REFOCUS_TIMEOUT_MS},
    );
    return {cancel: () => cancelIdleCallback(id)};
}

export default scheduleRefocus;
