import * as Composer from '@userActions/Composer';
import type SetShouldShowComposeInputKeyboardAware from './types';

const setShouldShowComposeInputKeyboardAware: SetShouldShowComposeInputKeyboardAware = (shouldShow) => {
    // When the edit composer loses focus, we want to show the main composer.
    // If it loses focus due to a pressable being pressed, the press event might not be captured.
    // To address this, we delay showing the main composer to allow the press event to complete.
    setTimeout(() => {
        Composer.setShouldShowComposeInput(shouldShow);
    }, 0);
};

export default setShouldShowComposeInputKeyboardAware;
