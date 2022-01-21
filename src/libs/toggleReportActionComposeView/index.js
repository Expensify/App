import * as Session from '../actions/Session';

export default (shouldShowComposeInput, isSmallScreenWidth) => {
    if (!isSmallScreenWidth) {
        return;
    }

    Session.setShouldShowComposeInput(shouldShowComposeInput);
};
