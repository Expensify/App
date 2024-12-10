import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';
import * as SessionUtils from './SessionUtils';

const isAccountIDEven = (accountID: number) => accountID % 2 === 0;

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

function canUseCategoryAndTagApprovers(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.CATEGORY_AND_TAG_APPROVERS) || canUseAllBetas(betas);
}

function canUseCombinedTrackSubmit(): boolean {
    // We don't need to show this to all betas since this will be used for developing a feature for A/B testing.
    const session = SessionUtils.getSession();
    return isAccountIDEven(session?.accountID ?? -1);
}

function canUsePerDiem(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.PER_DIEM) || canUseAllBetas(betas);
}

// TEMPORARY BETA TO HIDE PRODUCT TRAINING TOOLTIP AND MIGRATE USER WELCOME MODAL
function shouldShowProductTrainingElements(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.PRODUCT_TRAINING) || canUseAllBetas(betas);
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
    canUseSpotnanaTravel,
    canUseNetSuiteUSATax,
    canUseCombinedTrackSubmit,
    canUseCategoryAndTagApprovers,
    canUsePerDiem,
    shouldShowProductTrainingElements,
};
