import Onyx, {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Report} from '@src/types/onyx';
import * as OptionsListUtils from './OptionsListUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';

let allReports: OnyxCollection<Report>;

type BrickRoad = 'GBR' | 'RBR' | undefined;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

const getBrickRoadForPolicy = (policyReport: Report): BrickRoad => {
    const policyReportAction = ReportActionsUtils.getAllReportActions(policyReport.reportID);
    const reportErrors = OptionsListUtils.getAllReportErrors(policyReport, policyReportAction);
    const redBrickRoadIndicator = Object.keys(reportErrors ?? {}).length !== 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    if (redBrickRoadIndicator) {
        return 'RBR';
    }
    let itemParentReportAction = {};
    if (policyReport.parentReportID) {
        const itemParentReportActions = ReportActionsUtils.getAllReportActions(policyReport.parentReportID);
        itemParentReportAction = policyReport.parentReportActionID ? itemParentReportActions[policyReport.parentReportActionID] : {};
    }
    const optionFromPolicyReport = {...policyReport, isUnread: ReportUtils.isUnread(policyReport), isUnreadWithMention: ReportUtils.isUnreadWithMention(policyReport)};
    const shouldShowGreenDotIndicator = ReportUtils.requiresAttentionFromCurrentUser(optionFromPolicyReport, itemParentReportAction);
    return shouldShowGreenDotIndicator ? 'GBR' : undefined;
};

function getWorkspacesBrickRoads(): Record<string, BrickRoad> {
    if (!allReports) {
        return {};
    }

    const brickRoadsMap: Record<string, BrickRoad> = {};

    Object.keys(allReports).forEach((report) => {
        const policyID = allReports?.[report]?.policyID;
        const policyReport = allReports ? allReports[report] : null;
        if (!policyID || !policyReport || brickRoadsMap[policyID] === 'RBR') {
            return;
        }
        const policyBrickRoad = getBrickRoadForPolicy(policyReport);

        if (!policyBrickRoad && !!brickRoadsMap[policyID]) {
            return;
        }

        brickRoadsMap[policyID] = policyBrickRoad;
    });

    return brickRoadsMap;
}

export {getBrickRoadForPolicy, getWorkspacesBrickRoads};
export type {BrickRoad};
