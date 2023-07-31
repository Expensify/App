import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setSelectedTab(selectedTab) {
    Onyx.merge(ONYXKEYS.SELECTED_TAB, selectedTab);
}

export default {
    setSelectedTab,
};
