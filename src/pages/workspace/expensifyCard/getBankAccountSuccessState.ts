import CONST from '@src/CONST';
import type {ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type BankAccountSuccessState = 'loading' | 'unavailable' | 'ready';

function getBankAccountSuccessState(
    fundID: number,
    cardSettings: OnyxEntry<ExpensifyCardSettings>,
    isOnyxLoading: boolean,
    hasLoadedPage: boolean | undefined,
    hasLoadingError: boolean | undefined,
    isOffline: boolean,
): BankAccountSuccessState {
    if (isOnyxLoading || cardSettings?.isLoading || cardSettings?.US?.isLoading) {
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
