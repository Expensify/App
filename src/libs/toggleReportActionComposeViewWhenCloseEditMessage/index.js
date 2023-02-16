import * as Composer from '../actions/Composer';

export default (isSmallScreenWidth = true) => {
    if (!isSmallScreenWidth) {
        return;
    }

    Composer.setShouldShowComposeInput(true);
};
