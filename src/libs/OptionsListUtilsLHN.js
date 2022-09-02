import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let reports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: val => reports = val,
});

let personalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = val,
});

let currentlyViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => currentlyViewedReportID = val,
});

let priorityMode;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: val => priorityMode = val,
});

let betas;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIORITY_MODE,
    callback: val => betas = val,
});

let reportActions;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: val => reportActions = val,
});
