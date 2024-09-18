import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }

        allReportActions = actions;
    },
});

// This function is used to get all reports
function getAllReportActions() {
    return allReportActions;
}

// eslint-disable-next-line import/prefer-default-export
export {getAllReportActions};
