import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let stagingServerToggleState;
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: (val) => {
        stagingServerToggleState = lodashGet(val, 'shouldUseStagingServer');
    },
});

export default function getStagingToggleState() {
    if (typeof stagingServerToggleState !== 'boolean') {
        return false;
    }

    return stagingServerToggleState;
}
