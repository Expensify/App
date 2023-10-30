import * as Composer from '@userActions/Composer';
import SetShouldShowComposeInputKeyboardAware from './types';

const setShouldShowComposeInputKeyboardAware: SetShouldShowComposeInputKeyboardAware = (shouldShow) => {
    Composer.setShouldShowComposeInput(shouldShow);
};

export default setShouldShowComposeInputKeyboardAware;
