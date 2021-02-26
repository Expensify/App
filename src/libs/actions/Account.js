import lodashGet from 'lodash.get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import NameValuePair from './NameValuePair';

/**
 * Update the account priority mode.
 *
 * @param {String} mode
 */
function updatePriorityMode(mode) {
    NameValuePair.set('priorityMode', mode, ONYXKEYS.PRIORITY_MODE);
}

/**
 * Get the account priority mode and set it in Onyx state.
 */
function fetchPriorityMode() {
    API.Get({
        returnValueList: 'nameValuePairs',
        name: 'priorityMode',
    })
        .then((response) => {
            const priorityMode = lodashGet(response.nameValuePairs, ['priorityMode'], 'default');
            Onyx.set(ONYXKEYS.PRIORITY_MODE, priorityMode);
        });
}

export default {
    updatePriorityMode,
    fetchPriorityMode,
};
