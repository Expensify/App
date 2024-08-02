import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseViolations(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.VIOLATIONS) || canUseAllBetas(betas);
}

function canUseDupeDetection(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DUPE_DETECTION) || canUseAllBetas(betas);
}

function canUseP2PDistanceRequests(betas: OnyxEntry<Beta[]>, iouType: IOUType | undefined): boolean {
    // Allow using P2P distance request for TrackExpense outside of the beta, because that project doesn't want to be limited by the more cautious P2P distance beta
    return !!betas?.includes(CONST.BETAS.P2P_DISTANCE_REQUESTS) || canUseAllBetas(betas) || iouType === CONST.IOU.TYPE.TRACK;
}

function canUseWorkflowsAdvancedApproval(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WORKFLOWS_ADVANCED_APPROVAL) || canUseAllBetas(betas);
}

function canUseSpotnanaTravel(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.SPOTNANA_TRAVEL) || canUseAllBetas(betas);
}

function canUseReportFieldsFeature(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.REPORT_FIELDS_FEATURE) || canUseAllBetas(betas);
}

function canUseWorkspaceFeeds(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WORKSPACE_FEEDS) || canUseAllBetas(betas);
}

function canUseNetSuiteUSATax(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NETSUITE_USA_TAX) || canUseAllBetas(betas);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

export default {
    canUseDefaultRooms,
    canUseLinkPreviews,
    canUseViolations,
    canUseDupeDetection,
    canUseP2PDistanceRequests,
    canUseWorkflowsAdvancedApproval,
    canUseSpotnanaTravel,
    canUseReportFieldsFeature,
    canUseWorkspaceFeeds,
    canUseNetSuiteUSATax,
};
