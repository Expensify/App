/** Distinguishes loading and unavailable feeds from a confirmed settlement account. */
import CONST from '@src/CONST';
import type {ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type BankAccountSuccessState = 'loading' | 'unavailable' | 'ready';

function getBankAccountSuccessState(
    fundID: number,
    cardSettings: OnyxEntry<ExpensifyCardSettings>,
    hasLoadedPage: boolean | undefined,
    hasLoadingError: boolean | undefined,
    isOffline: boolean,
): BankAccountSuccessState {
    if (cardSettings?.isLoading || cardSettings?.US?.isLoading) {
        return 'loading';
    }
    if (fundID !== CONST.DEFAULT_NUMBER_ID && cardSettings?.US?.paymentBankAccountID) {
        return 'ready';
    }
    if (!isOffline && !hasLoadedPage && !hasLoadingError) {
        return 'loading';
    }
    return 'unavailable';
}

export default getBankAccountSuccessState;
