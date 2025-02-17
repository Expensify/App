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

function canUseNetSuiteUSATax(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NETSUITE_USA_TAX) || canUseAllBetas(betas);
}

function canUsePerDiem(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.PER_DIEM) || canUseAllBetas(betas);
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

function canUseInternationalBankAccount(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEWDOT_INTERNATIONAL_DEPOSIT_BANK_ACCOUNT) || canUseAllBetas(betas);
}

function canUseNSQS(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NSQS) || canUseAllBetas(betas);
}

function canUseCustomRules(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.CUSTOM_RULES) || canUseAllBetas(betas);
}

export default {
    canUseDefaultRooms,
    canUseLinkPreviews,
    canUseSpotnanaTravel,
    canUseNetSuiteUSATax,
    canUsePerDiem,
    canUseMergeAccounts,
    canUseManagerMcTest,
    canUseInternationalBankAccount,
    canUseNSQS,
    canUseCustomRules,
};
