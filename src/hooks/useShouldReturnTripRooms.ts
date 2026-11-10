import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import usePermissions from './usePermissions';

/**
 * Whether a search of this type returns one row per trip room. Trip searches only do that with the TravelApproval beta,
 * and stay expense searches without it.
 */
function useShouldReturnTripRooms(type: SearchDataTypes | undefined): boolean {
    const {isBetaEnabled} = usePermissions();
    return type === CONST.SEARCH.DATA_TYPES.TRIP && isBetaEnabled(CONST.BETAS.TRAVEL_APPROVAL);
}

export default useShouldReturnTripRooms;
