import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function canUseChronos(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.CHRONOS_IN_CASH) || canUseAllBetas(betas);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseCommentLinking(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.BETA_COMMENT_LINKING) || canUseAllBetas(betas);
}

function canUseReportFields(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.REPORT_FIELDS) || canUseAllBetas(betas);
}

function canUseViolations(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.VIOLATIONS) || canUseAllBetas(betas);
}

function canUseWorkflowsDelayedSubmission(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WORKFLOWS_DELAYED_SUBMISSION) || canUseAllBetas(betas);
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
    canUseCommentLinking,
    canUseLinkPreviews,
    canUseViolations,
    canUseReportFields,
    canUseWorkflowsDelayedSubmission,
};
