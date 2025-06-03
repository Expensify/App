import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function isBlockedFromSpotnanaTravel(betas: OnyxEntry<Beta[]>): boolean {
    // Don't check for all betas or nobody can use test travel on dev
    return !!betas?.includes(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
}

function isTravelVerified(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.IS_TRAVEL_VERIFIED) || canUseAllBetas(betas);
}

function canUseNetSuiteUSATax(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NETSUITE_USA_TAX) || canUseAllBetas(betas);
}

function canUseMultiLevelTags(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.MULTI_LEVEL_TAGS) || canUseAllBetas(betas);
}

/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews(): boolean {
    return false;
}

function canUseMergeAccounts(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEWDOT_MERGE_ACCOUNTS) || canUseAllBetas(betas);
}

function canUseManagerMcTest(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEWDOT_MANAGER_MCTEST) || canUseAllBetas(betas);
}

function canUseCustomRules(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.CUSTOM_RULES) || canUseAllBetas(betas);
}

/**
 * The feature is released so hardcoding the value to true while we clean up the beta from the code.
 */
function canUseTableReportView(betas: OnyxEntry<Beta[]>): boolean {
    return true || !!betas?.includes(CONST.BETAS.TABLE_REPORT_VIEW) || canUseAllBetas(betas);
}

function canUseTalkToAISales(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEW_DOT_TALK_TO_AI_SALES) || canUseAllBetas(betas);
}

function canUseInAppProvisioning(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WALLET) || canUseAllBetas(betas);
}

function canUseGlobalReimbursementsOnND(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND) || canUseAllBetas(betas);
}

function canUsePlaidCompanyCards(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.PLAID_COMPANY_CARDS) || canUseAllBetas(betas);
}

function canUseRetractNewDot(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.RETRACT_NEWDOT) || canUseAllBetas(betas);
}

function canUseMultiScan(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEWDOT_MULTI_SCAN) || canUseAllBetas(betas);
}

function canUseMultiFilesDragAndDrop(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) || canUseAllBetas(betas);
}

function canUseTrackFlows(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.TRACK_FLOWS) || canUseAllBetas(betas);
}

function canUseNewDotSplits(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEW_DOT_SPLITS) || canUseAllBetas(betas);
}

export default {
    canUseDefaultRooms,
    canUseLinkPreviews,
    isBlockedFromSpotnanaTravel,
    isTravelVerified,
    canUseNetSuiteUSATax,
    canUseMergeAccounts,
    canUseManagerMcTest,
    canUseCustomRules,
    canUseTableReportView,
    canUseTalkToAISales,
    canUseInAppProvisioning,
    canUseGlobalReimbursementsOnND,
    canUseRetractNewDot,
    canUseMultiLevelTags,
    canUseMultiFilesDragAndDrop,
    canUseMultiScan,
    canUseNewDotSplits,
    canUsePlaidCompanyCards,
    canUseTrackFlows,
};
