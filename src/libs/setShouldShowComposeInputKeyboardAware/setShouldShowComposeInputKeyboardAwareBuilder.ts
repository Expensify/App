import type {EmitterSubscription} from 'react-native';
import {Keyboard} from 'react-native';
import type {KeyboardEventName} from 'react-native/Libraries/Components/Keyboard/Keyboard';
import * as Composer from '@userActions/Composer';
import type SetShouldShowComposeInputKeyboardAware from './types';

let keyboardEventListener: EmitterSubscription | null = null;

const setShouldShowComposeInputKeyboardAwareBuilder: (keyboardEvent: KeyboardEventName) => SetShouldShowComposeInputKeyboardAware =
    (keyboardEvent: KeyboardEventName) => (shouldShow: boolean) => {
        if (keyboardEventListener) {
            keyboardEventListener.remove();
            keyboardEventListener = null;
        }

        if (!shouldShow) {
            Composer.setShouldShowComposeInput(false);
            return;
        }

        // If keyboard is already hidden, we should show composer immediately because keyboardDidHide event won't be called
        if (!Keyboard.isVisible()) {
            Composer.setShouldShowComposeInput(true);
            return;
        }

        keyboardEventListener = Keyboard.addListener(keyboardEvent, () => {
            Composer.setShouldShowComposeInput(true);
            keyboardEventListener?.remove();
        });
    };

export default setShouldShowComposeInputKeyboardAwareBuilder;
