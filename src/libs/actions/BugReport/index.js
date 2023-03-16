import Onyx from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import * as API from '../../API';
import getSystemDetails from './getSystemDetails';

function submitBugReport() {
    const systemDetails = getSystemDetails();

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: false,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: false,
            },
        },
    ];

    API.write('SubmitBugReport', {
        ...systemDetails,
    }, {optimisticData, successData, failureData});
}

let isBugReportModalOpen;
Onyx.connect({
    key: ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN,
    callback: flag => isBugReportModalOpen = flag,
});

/**
 * Set keyboard shortcuts flag to show modal
 */
function showBugReportModal() {
    if (isBugReportModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, true);
}

/**
 * Unset keyboard shortcuts flag to hide modal
 */
function hideBugReportModal() {
    if (!isBugReportModalOpen) {
        return;
    }
    Onyx.set(ONYXKEYS.IS_BUG_REPORT_SHORTCUTS_MODAL_OPEN, false);
}

export {
    submitBugReport,
    showBugReportModal,
    hideBugReportModal,
};
