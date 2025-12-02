import lodashFindLast from 'lodash/findLast';
import type {OnyxEntry} from 'react-native-onyx';
import {filterOutDeprecatedReportActions, getSortedReportActions} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

function getParentReportActionSelector(parentReportActions: OnyxEntry<ReportActions>, parentReportActionID?: string): OnyxEntry<ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

/**
 * In some cases, there can be multiple closed report actions in a chat report.
 * This method returns the last closed report action so we can always show the correct archived report reason.
 * Additionally, archived #admins and #announce do not have the closed report action so we will return null if none is found.
 *
 */
function getLastClosedReportAction(reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> {
    // If closed report action is not present, return early
    if (
        !Object.values(reportActions ?? {}).some((action) => {
            return action?.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED;
        })
    ) {
        return undefined;
    }

    const filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    const sortedReportActions = getSortedReportActions(filteredReportActions);
    return lodashFindLast(sortedReportActions, (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
}

export {getParentReportActionSelector, getLastClosedReportAction};
