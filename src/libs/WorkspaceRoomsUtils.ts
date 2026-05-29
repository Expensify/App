import type {OnyxEntry, Report} from 'react-native-onyx';
import getTopmostReportParams from './Navigation/helpers/getTopmostReportParams';
import isReportTopmostSplitNavigator from './Navigation/helpers/isReportTopmostSplitNavigator';
import {navigationRef} from './Navigation/Navigation';
import {isChatRoom, isPolicyExpenseChat} from './ReportUtils';

function shouldShowGoToRoom(report: OnyxEntry<Report>): boolean {
    if (!isChatRoom(report) && !isPolicyExpenseChat(report)) {
        return false;
    }
    if (!isReportTopmostSplitNavigator()) {
        return true;
    }
    const rootState = navigationRef.getRootState();
    const backgroundReportID = getTopmostReportParams(rootState)?.reportID;
    return backgroundReportID !== report?.reportID;
}

export default {shouldShowGoToRoom};
