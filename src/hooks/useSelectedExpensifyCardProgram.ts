import type {CardProgramKey} from '@libs/CardUtils';
import {getConfiguredExpensifyCardProgramKeys, getSelectableCardProgramKey} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Hook to get the currently selected Expensify Card program (US/GB) for a given policyID and fundID.
 * A single fund's settings can hold both programs, whose cards share one Onyx list, so this pairs with `useDefaultFundID`
 * to identify which program's cards/currency/settings to display.
 *
 * When nothing is stored yet, it falls back to the fund's first configured program (US before GB) so a fund that only
 * has a GB program still shows its cards on first load, while a US (or single-program) fund keeps behaving exactly as before.
 */
function useSelectedExpensifyCardProgram(policyID: string | undefined, fundID: number | undefined): CardProgramKey {
    const [lastSelectedExpensifyCardProgram] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_PROGRAM}${policyID}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);

    return getSelectableCardProgramKey(lastSelectedExpensifyCardProgram) ?? getConfiguredExpensifyCardProgramKeys(cardSettings).at(0) ?? CONST.COUNTRY.US;
}

export default useSelectedExpensifyCardProgram;
