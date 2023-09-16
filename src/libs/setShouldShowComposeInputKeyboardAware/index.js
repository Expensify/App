import * as Composer from '../actions/Composer';

export default (shouldShow) => {
    Composer.setShouldShowComposeInput(shouldShow);
};
