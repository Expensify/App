import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function onTabPress(tabSelected) {
    Onyx.merge(ONYXKEYS.TAB_SELECTOR, {selected: tabSelected});
}

export default {
    onTabPress,
};
