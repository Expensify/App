import type React from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';

/**
 * Check if the Enter key was pressed during IME confirmation (i.e. while the text is being composed).
 * See {@link https://en.wikipedia.org/wiki/Input_method}
 */
const isEnterWhileComposition = (event: KeyboardEvent | React.KeyboardEvent): boolean => {
    // if on mobile chrome, the enter key event is never fired when the enter key is pressed while composition.
    if (Browser.isMobileChrome()) {
        return false;
    }

    // On Safari, isComposing returns false on Enter keypress event even for IME confirmation. Although keyCode is deprecated,
    // reading keyCode is the only way available to distinguish Enter keypress event for IME confirmation.
    if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return event.keyCode === 229;
    }

    // Check if this is a native KeyboardEvent (has isComposing directly) or a React synthetic event (has nativeEvent.isComposing)
    // For native KeyboardEvent, isComposing is directly on the event
    // For React synthetic events, it's on event.nativeEvent.isComposing
    let isComposing: boolean | undefined;

    if (event instanceof KeyboardEvent) {
        isComposing = event.isComposing;
    } else {
        const nativeEvent = (event as unknown as NativeSyntheticEvent<KeyboardEvent>)?.nativeEvent;
        isComposing = nativeEvent?.isComposing;
    }

    return event.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && !!isComposing;
};

export default isEnterWhileComposition;
