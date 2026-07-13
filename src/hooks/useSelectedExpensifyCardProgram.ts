import type {CardProgramKey} from '@libs/CardUtils';
import {getConfiguredExpensifyCardProgramKeys, getSelectableCardProgramKey} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Hook to get the currently selected Expensify Card program (US/GB) for a given policyID and feed (fundID).
 * A single feed holds both programs' cards in one Onyx list, so this pairs with `useDefaultFundID` to identify
 * which program's cards/currency/settings to display.
 *
 * When nothing is stored yet, it falls back to the feed's first configured program (US before GB) so a feed that only
 * has a GB program still shows its cards on first load, while a US (or single-program) feed keeps behaving exactly as before.
 */
function useSelectedExpensifyCardProgram(policyID: string | undefined, fundID: number | undefined): CardProgramKey {
    const [lastSelectedExpensifyCardProgram] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_PROGRAM}${policyID}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);

    if (lastSelectedExpensifyCardProgram) {
        return getSelectableCardProgramKey(lastSelectedExpensifyCardProgram);
    }

    return getConfiguredExpensifyCardProgramKeys(cardSettings).at(0) ?? CONST.COUNTRY.US;
}

export default useSelectedExpensifyCardProgram;
