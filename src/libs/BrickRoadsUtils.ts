import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
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
 * @param report
 * @returns BrickRoad for the policy passed as a param
 */
const getBrickRoadForPolicy = (report: Report): BrickRoad => {
    const reportActions = ReportActionsUtils.getAllReportActions(report.reportID);
    const reportErrors = OptionsListUtils.getAllReportErrors(report, reportActions);
    const doesReportContainErrors = Object.keys(reportErrors ?? {}).length !== 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    if (doesReportContainErrors) {
        return CONST.BRICK_ROAD.RBR;
    }

    // To determine if the report requires attention from the current user, we need to load the parent report action
    let itemParentReportAction = {};
    if (report.parentReportID) {
        const itemParentReportActions = ReportActionsUtils.getAllReportActions(report.parentReportID);
        itemParentReportAction = report.parentReportActionID ? itemParentReportActions[report.parentReportActionID] : {};
    }
    const reportOption = {...report, isUnread: ReportUtils.isUnread(report), isUnreadWithMention: ReportUtils.isUnreadWithMention(report)};
    const shouldShowGreenDotIndicator = ReportUtils.requiresAttentionFromCurrentUser(reportOption, itemParentReportAction);
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
        const workspaceBrickRoad = getBrickRoadForPolicy(policyReport);

        if (!workspaceBrickRoad && !!workspacesBrickRoadsMap[policyID]) {
            return;
        }

        workspacesBrickRoadsMap[policyID] = workspaceBrickRoad;
    });

    return workspacesBrickRoadsMap;
}

export {getBrickRoadForPolicy, getWorkspacesBrickRoads};
export type {BrickRoad};
