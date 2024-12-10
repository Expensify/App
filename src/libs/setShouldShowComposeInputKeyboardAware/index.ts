import * as Composer from '@userActions/Composer';
import type SetShouldShowComposeInputKeyboardAware from './types';

const setShouldShowComposeInputKeyboardAware: SetShouldShowComposeInputKeyboardAware = (shouldShow) => {
    // We want to show the main composer when the edit composer loses focus.
    // If it loses focus due to a pressable being pressed, the press event might not be captured.
    // To address this, we delay showing the main composer to allow the press event to be completed.
    setTimeout(() => {
        Composer.setShouldShowComposeInput(shouldShow);
    }, 0);
};

export default setShouldShowComposeInputKeyboardAware;
