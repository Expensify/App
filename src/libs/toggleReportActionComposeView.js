import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

export default (shouldShowComposeInput, isSmallScreenWidth) => {
    if (isSmallScreenWidth) {
        Onyx.merge(ONYXKEYS.SESSION, {shouldShowComposeInput});
    }
};
