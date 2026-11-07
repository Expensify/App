import {render} from '@testing-library/react-native';

import type {SelectedTransactions} from '@components/Search/types';

import SearchTransactionsChangeReport from '@pages/Search/SearchTransactionsChangeReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Transaction} from '@src/types/onyx';

import React from 'react';

import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';

const CURRENT_USER_ACCOUNT_ID = 1;
const CARDHOLDER_ACCOUNT_ID = 20;
const SECOND_CARDHOLDER_ACCOUNT_ID = 30;
const FEED_CARD_ID = 301;
const SECOND_FEED_CARD_ID = 302;
const OWN_CARD_ID = 401;
const UNKNOWN_CARD_ID = 999;

let mockSelectedTransactions: SelectedTransactions = {};
let mockOnyxValues: Record<string, unknown> = {};
const mockEditReportCommon = jest.fn<null, [Record<string, unknown>]>(() => null);

jest.mock('@pages/iou/request/step/IOURequestEditReportCommon', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => mockEditReportCommon(props),
}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({selectedTransactions: mockSelectedTransactions, areAllMatchingItemsSelected: false, excludedTransactions: {}}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
    useSearchResultsContext: () => ({currentSearchResults: undefined}),
    useSearchQueryContext: () => ({currentSearchQueryJSON: undefined}),
}));
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
    useSession: () => ({accountID: 1, email: 'user@test.com'}),
}));
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => [mockOnyxValues[key]],
}));
jest.mock('@hooks/useAlertModals', () => ({__esModule: true, default: () => ({showOfflineModal: jest.fn()})}));
jest.mock('@hooks/useChangeTransactionsReportReports', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useConditionalCreateEmptyReportConfirmation', () => ({__esModule: true, default: () => ({handleCreateReport: jest.fn()})}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));
jest.mock('@hooks/useDelegateAccountID', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useHasPerDiemTransactions', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useHydrateReportsFromSnapshot', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useLoadSearchCardData', () => ({__esModule: true, default: () => ({areCardsLoaded: true})}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false})}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: undefined, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded: true}),
}));

function makeUnreportedCardExpense(transactionID: string, cardID: number): SelectedTransactions[string] {
    const transaction: Transaction = {...createRandomTransaction(1), transactionID, reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID, managedCard: true};
    return createMock<SelectedTransactions[string]>({isSelected: true, canChangeReport: true, reportID: CONST.REPORT.UNREPORTED_REPORT_ID, policyID: undefined, transaction});
}

function renderAndGetEditReportProps() {
    render(<SearchTransactionsChangeReport />);
    return mockEditReportCommon.mock.calls.at(-1)?.at(0);
}

describe('SearchTransactionsChangeReport', () => {
    beforeEach(() => {
        mockEditReportCommon.mockClear();
        mockOnyxValues = {};
        mockSelectedTransactions = {};
    });

    it("targets another cardholder's reports when moving their unreported card expenses", () => {
        // Given an admin moving two unreported expenses from a card on a feed they manage, owned by someone else
        const nonPersonalAndWorkspaceCards: CardList = {[FEED_CARD_ID]: createMock<Card>({cardID: FEED_CARD_ID, accountID: CARDHOLDER_ACCOUNT_ID})};
        mockOnyxValues = {[ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST]: nonPersonalAndWorkspaceCards};
        mockSelectedTransactions = {tx1: makeUnreportedCardExpense('tx1', FEED_CARD_ID), tx2: makeUnreportedCardExpense('tx2', FEED_CARD_ID)};

        // When the Move screen opens
        const props = renderAndGetEditReportProps();

        // Then it lists and creates reports for the cardholder, not the current user, and sees a single submitter
        expect(props?.targetOwnerAccountID).toBe(CARDHOLDER_ACCOUNT_ID);
        expect(props?.targetOwnerAccountID).not.toBe(CURRENT_USER_ACCOUNT_ID);
        expect(props?.hasMultipleSubmitters).toBe(false);
    });

    it('detects multiple submitters when the unreported card expenses belong to different cardholders', () => {
        // Given unreported expenses from two different cardholders' cards
        const nonPersonalAndWorkspaceCards: CardList = {
            [FEED_CARD_ID]: createMock<Card>({cardID: FEED_CARD_ID, accountID: CARDHOLDER_ACCOUNT_ID}),
            [SECOND_FEED_CARD_ID]: createMock<Card>({cardID: SECOND_FEED_CARD_ID, accountID: SECOND_CARDHOLDER_ACCOUNT_ID}),
        };
        mockOnyxValues = {[ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST]: nonPersonalAndWorkspaceCards};
        mockSelectedTransactions = {tx1: makeUnreportedCardExpense('tx1', FEED_CARD_ID), tx2: makeUnreportedCardExpense('tx2', SECOND_FEED_CARD_ID)};

        // When the Move screen opens
        const props = renderAndGetEditReportProps();

        // Then it knows the selection spans submitters, so Auto report can be offered
        expect(props?.hasMultipleSubmitters).toBe(true);
        expect(props?.areAllManagedCardsResolvable).toBe(true);
    });

    it("resolves the owner from the user's own card list", () => {
        // Given two unreported expenses on the user's own card
        mockOnyxValues = {[ONYXKEYS.CARD_LIST]: {[OWN_CARD_ID]: createMock<Card>({cardID: OWN_CARD_ID, accountID: CURRENT_USER_ACCOUNT_ID})}};
        mockSelectedTransactions = {tx1: makeUnreportedCardExpense('tx1', OWN_CARD_ID), tx2: makeUnreportedCardExpense('tx2', OWN_CARD_ID)};

        // When the Move screen opens
        const props = renderAndGetEditReportProps();

        // Then the user is the target owner and there is a single submitter
        expect(props?.targetOwnerAccountID).toBe(CURRENT_USER_ACCOUNT_ID);
        expect(props?.hasMultipleSubmitters).toBe(false);
    });

    it('leaves the owner unresolved when the card cannot be found', () => {
        // Given unreported expenses on a card the user cannot see
        mockSelectedTransactions = {tx1: makeUnreportedCardExpense('tx1', UNKNOWN_CARD_ID), tx2: makeUnreportedCardExpense('tx2', UNKNOWN_CARD_ID)};

        // When the Move screen opens
        const props = renderAndGetEditReportProps();

        // Then no owner is guessed and the selection is not treated as mixed
        expect(props?.targetOwnerAccountID).toBeUndefined();
        expect(props?.hasMultipleSubmitters).toBe(false);
    });
});
