import * as Composer from '../actions/Composer';

export default (shouldShowComposeInput, isSmallScreenWidth = true) => {
    if (!isSmallScreenWidth) {
        return;
    }

    Composer.setShouldShowComposeInput(shouldShowComposeInput);
};
