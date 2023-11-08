import {EmitterSubscription, Keyboard} from 'react-native';
import {KeyboardEventName} from 'react-native/Libraries/Components/Keyboard/Keyboard';
import * as Composer from '@userActions/Composer';
import SetShouldShowComposeInputKeyboardAware from './types';

let keyboardEventListener: EmitterSubscription | null = null;
// On iOS, there is a visible delay in displaying input after the keyboard has been closed with the `keyboardDidHide` event
// Because of that - on iOS we can use `keyboardWillHide` that is not available on android

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
