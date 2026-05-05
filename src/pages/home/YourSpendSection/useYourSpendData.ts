import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getDisplayableExpensifyCards} from '@libs/CardUtils';
import {arePaymentsEnabled, hasApprovalFlow, isPaidGroupPolicy} from '@libs/PolicyUtils';
import type {Policy} from '@src/types/onyx';
import type {CardList} from '@src/types/onyx/Card';
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

type YourSpendApplicability = {
    isApprovalApplicable: boolean;
    isPaymentApplicable: boolean;
    isCardApplicable: boolean;
};

function getYourSpendApplicability(policies: OnyxCollection<Policy> | undefined, cardList: CardList | undefined): YourSpendApplicability {
    const policyList = Object.values(policies ?? {});
    const isApprovalApplicable = policyList.some((policy) => hasApprovalFlow(policy));
    const isPaymentApplicable = policyList.some((policy) => isPaidGroupPolicy(policy) && arePaymentsEnabled(policy ?? undefined));
    const isCardApplicable = getDisplayableExpensifyCards(cardList).length > 0;
    return {isApprovalApplicable, isPaymentApplicable, isCardApplicable};
}

type UseYourSpendDataReturn = {
    approvalRowState: YourSpendRowState;
    paymentRowState: YourSpendRowState;
    cardRows: YourSpendCardRow[];
    awaitingApprovalQuery: string;
    repaidLast30DaysQuery: string;
};

function getYourSpendRowState({isApplicable, isOffline, searchResults}: GetYourSpendRowStateParams): YourSpendRowState {
    if (!isApplicable) {
        return YOUR_SPEND_ROW_STATE.HIDDEN;
    }
    if (isOffline && !searchResults) {
        return YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY;
    }
    if (!searchResults) {
        return YOUR_SPEND_ROW_STATE.LOADING;
    }
    if (!searchResults.search.count) {
        return YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY;
    }
    return YOUR_SPEND_ROW_STATE.READY;
}

function useYourSpendData(): UseYourSpendDataReturn {
    throw new Error('useYourSpendData is not implemented yet.');
}

export {YOUR_SPEND_ROW_STATE, getYourSpendApplicability, getYourSpendRowState, useYourSpendData};
export type {GetYourSpendRowStateParams, UseYourSpendDataReturn, YourSpendApplicability, YourSpendCardRow, YourSpendRowState};
