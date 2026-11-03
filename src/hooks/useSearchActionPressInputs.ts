import {useSearchSubmitPopoverGuard} from '@components/ReportSubmitToPopoverAnchor';

import {doesSearchActionUsePressTimeInputs} from '@libs/actions/Search';

import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

import type {SearchActionInputs} from './usePaymentContext';

import usePaymentContext from './usePaymentContext';

const EMPTY_SEARCH_ACTION_INPUTS: SearchActionInputs = {
    conciergeChat: undefined,
    introSelected: undefined,
    isSelfTourViewed: undefined,
    amountOwed: undefined,
    bankAccountList: undefined,
};

/**
 * Reads the press-time inputs for a Search row action and resolves to undefined when the submit-to popover intercepted the press.
 * The intercept runs before the first await because its one-shot flag resets in a microtask.
 */
function useSearchActionPressInputs() {
    const {interceptSearchSubmitPress} = useSearchSubmitPopoverGuard();
    const {readSearchActionInputs} = usePaymentContext();

    return async (action: SearchTransactionAction | undefined): Promise<SearchActionInputs | undefined> => {
        if (interceptSearchSubmitPress(action)) {
            return undefined;
        }
        return doesSearchActionUsePressTimeInputs(action) ? readSearchActionInputs() : EMPTY_SEARCH_ACTION_INPUTS;
    };
}

export default useSearchActionPressInputs;
export {EMPTY_SEARCH_ACTION_INPUTS};
