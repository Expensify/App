import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DistanceExpenseType, LastDistanceExpenseTypeNVP} from '@src/types/onyx/IOU';
import useOnyx from './useOnyx';

/**
 * The backend stores 'map' in the lastDistanceExpenseType NVP for map distance expenses, and accounts
 * that predate the explicit map value may still have an empty string. Both resolve to DISTANCE_MAP.
 */
function lastDistanceExpenseTypeSelector(lastDistanceExpenseType: LastDistanceExpenseTypeNVP | undefined): DistanceExpenseType | undefined {
    if (lastDistanceExpenseType === CONST.IOU.LAST_DISTANCE_EXPENSE_TYPE_NVP_MAP || lastDistanceExpenseType === '') {
        return CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
    }
    return lastDistanceExpenseType;
}

/** Returns the type of the user's most recent distance expense */
function useLastDistanceExpenseType(): DistanceExpenseType | undefined {
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {selector: lastDistanceExpenseTypeSelector});
    return lastDistanceExpenseType;
}

export default useLastDistanceExpenseType;
