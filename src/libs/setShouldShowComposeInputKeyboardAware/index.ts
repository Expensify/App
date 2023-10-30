import * as Composer from '../actions/Composer';
import SetShouldShowComposeInputKeyboardAware from './types';

const setShouldShowComposeInputKeyboardAware: SetShouldShowComposeInputKeyboardAware = (shouldShow) => {
    Composer.setShouldShowComposeInput(shouldShow);
};

export default setShouldShowComposeInputKeyboardAware;
