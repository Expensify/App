import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type SearchResults from '@src/types/onyx/SearchResults';
import YOUR_SPEND_ROW_STATE from './const';

type YourSpendRowState = ValueOf<typeof YOUR_SPEND_ROW_STATE>;

type GetYourSpendRowStateParams = {
    isApplicable: boolean;
    isOffline: boolean;
    searchResults: OnyxEntry<SearchResults>;
};

type YourSpendCardRow = {
    cardID: number;
    lastFour: string;
    query: string;
};

type UseYourSpendDataReturn = {
    approvalRowState: YourSpendRowState;
    paymentRowState: YourSpendRowState;
    cardRows: YourSpendCardRow[];
    awaitingApprovalQuery: string;
    repaidLast30DaysQuery: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getYourSpendRowState({isApplicable, isOffline, searchResults}: GetYourSpendRowStateParams): YourSpendRowState {
    throw new Error('getYourSpendRowState is not implemented yet.');
}

function useYourSpendData(): UseYourSpendDataReturn {
    throw new Error('useYourSpendData is not implemented yet.');
}

export {YOUR_SPEND_ROW_STATE, getYourSpendRowState, useYourSpendData};
export type {YourSpendRowState, GetYourSpendRowStateParams, UseYourSpendDataReturn, YourSpendCardRow};
