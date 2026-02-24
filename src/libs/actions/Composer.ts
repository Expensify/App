import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setShouldShowComposeInput(shouldShowComposeInput: boolean) {
    Onyx.set(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, shouldShowComposeInput);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setShouldShowComposeInput,
};
