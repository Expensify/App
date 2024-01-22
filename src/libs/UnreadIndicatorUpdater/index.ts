import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import updateUnread from './updateUnread';

let allReports: OnyxCollection<Report> = {};

const triggerUnreadUpdate = () => {
    const currentReportID = navigationRef.isReady() ? Navigation.getTopmostReportId() : '';

    // We want to keep notification count consistent with what can be accessed from the LHN list
    const unreadReports = Object.values(allReports ?? {}).filter((report) => {
        if (!ReportUtils.isUnread(report)) {
            return false;
        }

        return ReportUtils.shouldReportBeInOptionList({
            report,
            currentReportId: currentReportID ?? '',
            betas: [],
            policies: {},
            doesReportHaveViolations: false,
            isInGSDMode: false,
            excludeEmptyChats: false,
        });
    });
    updateUnread(unreadReports.length);
};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        allReports = reportsFromOnyx;
        triggerUnreadUpdate();
    },
});

navigationRef.addListener('state', () => {
    triggerUnreadUpdate();
});
