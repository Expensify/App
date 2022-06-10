import * as Session from '../actions/Session';

export default (shouldShowComposeInput, isSmallScreenWidth = true) => {
    if (!isSmallScreenWidth) {
        return;
    }

    Session.setShouldShowComposeInput(shouldShowComposeInput);
};
