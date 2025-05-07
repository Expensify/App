import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseSpotnanaTravel(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.SPOTNANA_TRAVEL) || canUseAllBetas(betas);
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

function canUseTableReportView(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.TABLE_REPORT_VIEW) || canUseAllBetas(betas);
}

function canUseTalkToAISales(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEW_DOT_TALK_TO_AI_SALES) || canUseAllBetas(betas);
}

function canUseProhibitedExpenses(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.RECEIPT_LINE_ITEMS) || canUseAllBetas(betas);
}

function canUseInAppProvisioning(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WALLET) || canUseAllBetas(betas);
}

function canUseGlobalReimbursementsOnND(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND) || canUseAllBetas(betas);
}

function canUsePrivateDomainOnboarding(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.PRIVATE_DOMAIN_ONBOARDING) || canUseAllBetas(betas);
}

function canUseCallScheduling() {
    return false;
}

export default {
    canUseDefaultRooms,
    canUseLinkPreviews,
    canUseSpotnanaTravel,
    isBlockedFromSpotnanaTravel,
    isTravelVerified,
    canUseNetSuiteUSATax,
    canUseMergeAccounts,
    canUseManagerMcTest,
    canUseCustomRules,
    canUseTableReportView,
    canUseTalkToAISales,
    canUseProhibitedExpenses,
    canUseInAppProvisioning,
    canUseGlobalReimbursementsOnND,
    canUsePrivateDomainOnboarding,
    canUseCallScheduling,
};
