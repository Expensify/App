import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseDupeDetection(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DUPE_DETECTION) || canUseAllBetas(betas);
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

function canUseCombinedTrackSubmit(betas: OnyxEntry<Beta[]>): boolean {
    // We don't need to show this to all betas since this will be used for developing a feature for A/B testing.
    return !!betas?.includes(CONST.BETAS.COMBINED_TRACK_SUBMIT);
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

export default {
    canUseDefaultRooms,
    canUseLinkPreviews,
    canUseDupeDetection,
    canUseSpotnanaTravel,
    canUseNetSuiteUSATax,
    canUseCombinedTrackSubmit,
    canUseCategoryAndTagApprovers,
    canUsePerDiem,
};
