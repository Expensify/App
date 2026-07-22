import type {CardProgramKey} from '@libs/CardUtils';
import {getConfiguredExpensifyCardProgramKeys, parseCardFeedKey} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Hook to get the currently selected Expensify Card program (US/GB) for a given policyID and fundID.
 * A single fund's settings can hold both programs, whose cards share one Onyx list, so this pairs with `useDefaultFundID`
 * to identify which program's cards/currency/settings to display.
 *
 * The program is read from the `fundID_programKey` composite stored in `LAST_SELECTED_EXPENSIFY_CARD_FEED`, and is honored
 * only while that program is still configured on the fund. Once it is gone (or nothing is stored yet, e.g. a value saved
 * before the program was persisted with the feed) it falls back to the fund's first configured program (US before GB) so a
 * fund that only has a GB program still shows its cards, while a US (or single-program) fund keeps behaving exactly as before.
 */
function useSelectedExpensifyCardProgram(policyID: string | undefined, fundID: number | undefined): CardProgramKey {
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);

    const {programKey: lastSelectedProgramKey} = parseCardFeedKey(lastSelectedExpensifyCardFeed);
    const configuredProgramKeys = getConfiguredExpensifyCardProgramKeys(cardSettings);
    const storedProgramKey = configuredProgramKeys.find((key) => key === lastSelectedProgramKey);

    return storedProgramKey ?? configuredProgramKeys.at(0) ?? CONST.COUNTRY.US;
}

export default useSelectedExpensifyCardProgram;
