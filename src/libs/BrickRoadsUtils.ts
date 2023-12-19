import Onyx, {OnyxCollection} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Report} from '@src/types/onyx';
import * as OptionsListUtils from './OptionsListUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';

let allReports: OnyxCollection<Report>;

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD> | undefined;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

/**
 * @param policyReport
 * @returns BrickRoad for the policy passed as a param
 */
const getBrickRoadForPolicy = (policyReport: Report): BrickRoad => {
    const policyReportAction = ReportActionsUtils.getAllReportActions(policyReport.reportID);
    const reportErrors = OptionsListUtils.getAllReportErrors(policyReport, policyReportAction);
    const doesReportContainErrors = Object.keys(reportErrors ?? {}).length !== 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    if (doesReportContainErrors) {
        return CONST.BRICK_ROAD.RBR;
    }
    let itemParentReportAction = {};
    if (policyReport.parentReportID) {
        const itemParentReportActions = ReportActionsUtils.getAllReportActions(policyReport.parentReportID);
        itemParentReportAction = policyReport.parentReportActionID ? itemParentReportActions[policyReport.parentReportActionID] : {};
    }
    const optionFromPolicyReport = {...policyReport, isUnread: ReportUtils.isUnread(policyReport), isUnreadWithMention: ReportUtils.isUnreadWithMention(policyReport)};
    const shouldShowGreenDotIndicator = ReportUtils.requiresAttentionFromCurrentUser(optionFromPolicyReport, itemParentReportAction);
    return shouldShowGreenDotIndicator ? CONST.BRICK_ROAD.GBR : undefined;
};

/**
 * @returns a map where the keys are policyIDs and the values are BrickRoads for each policy
 */
function getWorkspacesBrickRoads(): Record<string, BrickRoad> {
    if (!allReports) {
        return {};
    }

    // The key in this map is the workspace id
    const workspacesBrickRoadsMap: Record<string, BrickRoad> = {};

    Object.keys(allReports).forEach((report) => {
        const policyID = allReports?.[report]?.policyID;
        const policyReport = allReports ? allReports[report] : null;
        if (!policyID || !policyReport || workspacesBrickRoadsMap[policyID] === CONST.BRICK_ROAD.RBR) {
            return;
        }
        const policyBrickRoad = getBrickRoadForPolicy(policyReport);

        if (!policyBrickRoad && !!workspacesBrickRoadsMap[policyID]) {
            return;
        }

        workspacesBrickRoadsMap[policyID] = policyBrickRoad;
    });

    return workspacesBrickRoadsMap;
}

export {getBrickRoadForPolicy, getWorkspacesBrickRoads};
export type {BrickRoad};
