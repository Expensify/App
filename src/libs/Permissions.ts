import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type Beta from '@src/types/onyx/Beta';
import * as Environment from './Environment/Environment';

function canUseAllBetas(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.ALL);
}

function canUseDefaultRooms(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DEFAULT_ROOMS) || canUseAllBetas(betas);
}

function canUseDupeDetection(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DUPE_DETECTION) || canUseAllBetas(betas);
}

function canUseP2PDistanceRequests(betas: OnyxEntry<Beta[]>, iouType: IOUType | undefined): boolean {
    // Allow using P2P distance request for TrackExpense outside of the beta, because that project doesn't want to be limited by the more cautious P2P distance beta
    return !!betas?.includes(CONST.BETAS.P2P_DISTANCE_REQUESTS) || canUseAllBetas(betas) || iouType === CONST.IOU.TYPE.TRACK;
}

function canUseSpotnanaTravel(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.SPOTNANA_TRAVEL) || canUseAllBetas(betas);
}

function canUseWorkspaceFeeds(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WORKSPACE_FEEDS) || canUseAllBetas(betas);
}

function canUseCompanyCardFeeds(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.COMPANY_CARD_FEEDS) || canUseAllBetas(betas);
}

function canUseDirectFeeds(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.DIRECT_FEEDS) || canUseAllBetas(betas);
}

function canUseNetSuiteUSATax(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NETSUITE_USA_TAX) || canUseAllBetas(betas);
}

function canUseNewDotCopilot(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEW_DOT_COPILOT) || canUseAllBetas(betas);
}

function canUseWorkspaceRules(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.WORKSPACE_RULES) || canUseAllBetas(betas);
}

function canUseCombinedTrackSubmit(betas: OnyxEntry<Beta[]>): boolean {
    // We don't need to show this to all betas since this will be used for developing a feature for A/B testing.
    return !!betas?.includes(CONST.BETAS.COMBINED_TRACK_SUBMIT);
}

function canUseNewDotQBD(betas: OnyxEntry<Beta[]>): boolean {
    return !!betas?.includes(CONST.BETAS.NEW_DOT_QBD) || canUseAllBetas(betas);
}

/**
 * New Search Router is under construction and for now should be displayed only in dev to allow developers to work on it.
 * We are not using BETA for this feature, as betas are heavier to cleanup,
 * and the development of new router is expected to take 2-3 weeks at most
 *
 * After everything is implemented this function can be removed, as we will always use SearchRouter in the App.
 */
function canUseNewSearchRouter() {
    return Environment.isDevelopment();
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
    canUseP2PDistanceRequests,
    canUseSpotnanaTravel,
    canUseWorkspaceFeeds,
    canUseCompanyCardFeeds,
    canUseDirectFeeds,
    canUseNetSuiteUSATax,
    canUseNewDotCopilot,
    canUseWorkspaceRules,
    canUseCombinedTrackSubmit,
    canUseNewSearchRouter,
    canUseNewDotQBD,
};
