import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';

function runMoney2020Demo() {
    // createDemoWorkspaceAndNavigate(CONST.EMAIL.MONEY2020, 'CreateChatReport');
}

/**
 * Runs code for specific demos, based on the provided URL
 *
 * @param {String} url - URL user is navigating to via deep link (or regular link in web)
 */
function runDemoByURL(url = '') {
    const cleanUrl = (url || '').toLowerCase();

    if (cleanUrl.endsWith(ROUTES.MONEY2020)) {
        Onyx.set(ONYXKEYS.DEMO_INFO, {
            money2020: {
                isBeginningDemo: true,
            },
        });
    } else {
        // No demo is being run, so clear out demo info
        Onyx.set(ONYXKEYS.DEMO_INFO, null);
    }
}

export {runMoney2020Demo, runDemoByURL};

