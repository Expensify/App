import * as Session from '../actions/Session/Session';

export default (shouldShowComposeInput, isSmallScreenWidth) => {
    if (!isSmallScreenWidth) {
        return;
    }

    Session.setShouldShowComposeInput(shouldShowComposeInput);
};
