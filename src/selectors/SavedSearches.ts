import CONST from '@src/CONST';
import type {SaveSearch} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type SavedSearchesPresence = {
    hasSavedSearches: boolean;

    /** Whether a saved search is not waiting to be deleted, which is what keeps the Saved section online */
    hasSavedSearchesNotPendingDelete: boolean;
};

const savedSearchesPresenceSelector = (savedSearches: OnyxEntry<SaveSearch>): SavedSearchesPresence => {
    const items = Object.values(savedSearches ?? {});
    return {
        hasSavedSearches: items.length > 0,
        hasSavedSearchesNotPendingDelete: items.some((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    };
};

/**
 * Whether the Spend menu, and with it the flat nav Saved section, shows saved searches. A saved search waiting to be
 * deleted still counts offline, where it stays in the list until the deletion is sent.
 */
function shouldShowSavedSearchesSection(savedSearchesPresence: SavedSearchesPresence | undefined, isOffline: boolean | undefined): boolean {
    return !!savedSearchesPresence?.hasSavedSearchesNotPendingDelete || (!!isOffline && !!savedSearchesPresence?.hasSavedSearches);
}

export {savedSearchesPresenceSelector, shouldShowSavedSearchesSection};
