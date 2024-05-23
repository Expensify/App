import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return true;
}

function canUseChronos(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.CHRONOS_IN_CASH) || canUseAllBetas(betas);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseReportFields(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.REPORT_FIELDS) || canUseAllBetas(betas);
}

function canUseViolations(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.VIOLATIONS) || canUseAllBetas(betas);
}

function canUseP2PDistanceRequests(betas: OnyxEntry<Beta[]>, iouType: IOUType | undefined): boolean {
    // Allow using P2P distance request for TrackExpense outside of the beta, because that project doesn't want to be limited by the more cautious P2P distance beta
    return !!betas?.includes(CONST.BETAS.P2P_DISTANCE_REQUESTS) || canUseAllBetas(betas) || iouType === CONST.IOU.TYPE.TRACK;
}

function canUseWorkflowsDelayedSubmission(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WORKFLOWS_DELAYED_SUBMISSION) || canUseAllBetas(betas);
}

function canUseSpotnanaTravel(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.SPOTNANA_TRAVEL) || canUseAllBetas(betas);
}

function canUseAccountingIntegrations(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ACCOUNTING_ON_NEW_EXPENSIFY) || canUseAllBetas(betas);
}

function canUseXeroIntegration(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.XERO_ON_NEW_EXPENSIFY) || canUseAllBetas(betas);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

export default {
    canUseChronos,
    canUseDefaultRooms,
    canUseLinkPreviews,
    canUseViolations,
    canUseReportFields,
    canUseP2PDistanceRequests,
    canUseWorkflowsDelayedSubmission,
    canUseSpotnanaTravel,
    canUseAccountingIntegrations,
    canUseXeroIntegration,
};
