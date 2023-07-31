import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setSelectedTab(id, index) {
    Onyx.merge(`${ONYXKEYS.SELECTED_TAB}_${id}`, index);
}

export default {
    setSelectedTab,
};
