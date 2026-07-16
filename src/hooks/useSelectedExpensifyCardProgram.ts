import type {CardProgramKey} from '@libs/CardUtils';
import {getConfiguredExpensifyCardProgramKeys} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Hook to get the currently selected Expensify Card program (US/GB) for a given policyID and fundID.
 * A single fund's settings can hold both programs, whose cards share one Onyx list, so this pairs with `useDefaultFundID`
 * to identify which program's cards/currency/settings to display.
 *
 * The stored selection is honored only while that program is still configured on the fund; once it is gone (or nothing is
 * stored yet) it falls back to the fund's first configured program (US before GB) so a fund that only has a GB program
 * still shows its cards, while a US (or single-program) fund keeps behaving exactly as before.
 */
function useSelectedExpensifyCardProgram(policyID: string | undefined, fundID: number | undefined): CardProgramKey {
    const [lastSelectedExpensifyCardProgram] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_PROGRAM}${policyID}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);

    const configuredProgramKeys = getConfiguredExpensifyCardProgramKeys(cardSettings);
    const storedProgramKey = configuredProgramKeys.find((key) => key === lastSelectedExpensifyCardProgram);

    return storedProgramKey ?? configuredProgramKeys.at(0) ?? CONST.COUNTRY.US;
}

export default useSelectedExpensifyCardProgram;
