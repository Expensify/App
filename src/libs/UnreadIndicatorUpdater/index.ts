import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import updateUnread from './updateUnread';
import * as ReportUtils from '../ReportUtils';

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        const unreadReports = Object.values(reportsFromOnyx ?? {}).filter((report) => ReportUtils.isUnread(report));
        updateUnread(unreadReports.length);
    },
});
