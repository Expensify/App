import type {OnyxEntry} from 'react-native-onyx';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import {navigationRef} from '@libs/Navigation/Navigation';
import {isChatRoom, isPolicyExpenseChat} from '@libs/ReportUtils';
import type {Report} from '@src/types/onyx';

function shouldShowGoToRoom(report: OnyxEntry<Report>): boolean {
    if (!isChatRoom(report) && !isPolicyExpenseChat(report)) {
        return false;
    }
    if (!isReportTopmostSplitNavigator()) {
        return true;
    }
    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return true;
    }
    const backgroundReportID = getTopmostReportParams(rootState)?.reportID;
    return backgroundReportID !== report?.reportID;
}

export {shouldShowGoToRoom};
