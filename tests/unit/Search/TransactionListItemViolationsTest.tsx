import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type * as SearchContextModule from '@components/Search/SearchContext';
import TransactionListItem from '@components/Search/SearchList/ListItem/TransactionListItem';
import TransactionListItemNarrow from '@components/Search/SearchList/ListItem/TransactionListItem/TransactionListItemNarrow';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import useConfirmApproveReportViolations from '@hooks/useConfirmApproveReportViolations';
import useNetwork from '@hooks/useNetwork';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx/TransactionViolation';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const TRANSACTION_ID = '1';
const REPORT_ID = '515146912679679';
const POLICY_ID = '06F34677820A4D07';
const TRANSACTION_VIOLATIONS_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}` as const;

const mockSearchResults: {current: {data: Record<string, unknown>} | undefined} = {current: undefined};

jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn(() => ({isOffline: false}))}));

jest.mock('@hooks/useConfirmApproveReportViolations', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof SearchContextModule>('@components/Search/SearchContext'),
    useSearchQueryContext: () => ({currentSearchHash: 1, currentSearchKey: undefined}),
    useSearchResultsContext: () => ({currentSearchResults: mockSearchResults.current, currentSearchTransactionsByReportID: new Map(), currentSearchViolations: {}}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({isSmallScreenWidth: true, isLargeScreenWidth: false, shouldUseNarrowLayout: true})),
}));

jest.mock('@hooks/usePaymentContext', () => {
    const {default: mockUsePaymentContext} = jest.requireActual<typeof MockUsePaymentContextUtil>('../../utils/mockUsePaymentContext');
    return mockUsePaymentContext;
});

jest.mock('@libs/actions/Search', () => ({
    handleActionButtonPress: jest.fn(),
}));

// Render only the violations the row hands to its layout, so the test checks the data source and not the row UI
jest.mock('@components/Search/SearchList/ListItem/TransactionListItem/TransactionListItemNarrow', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children: React.ReactNode}>}>('react-native');
    return {
        __esModule: true,
        default: jest.fn(({transactionViolations}: {transactionViolations: TransactionViolation[]}) => <Text>{transactionViolations.map((violation) => violation.name).join(',')}</Text>),
    };
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixture is an intentionally partial TransactionListItemType row
const mockTransaction = {
    accountID: 1,
    amount: -1284,
    category: '',
    created: '2025-09-19',
    currency: 'USD',
    merchant: 'The Home Depot',
    policyID: POLICY_ID,
    reportID: REPORT_ID,
    tag: '',
    transactionID: TRANSACTION_ID,
    action: CONST.SEARCH.ACTION_TYPES.VIEW,
    allActions: [CONST.SEARCH.ACTION_TYPES.VIEW],
    keyForList: TRANSACTION_ID,
    report: {reportID: REPORT_ID},
    reportAction: {reportActionID: '2454187434077044186', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, created: '2025-09-19'},
} as unknown as TransactionListItemType;

const snapshotViolation: TransactionViolation = {name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION};
const liveViolation: TransactionViolation = {name: CONST.VIOLATIONS.OVER_LIMIT, type: CONST.VIOLATION_TYPES.VIOLATION};

function renderRow() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <TransactionListItem
                item={mockTransaction}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />
        </ComposeProviders>,
    );
}

describe('TransactionListItem violations', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        await Onyx.clear();
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        mockSearchResults.current = {
            data: {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: {reportID: REPORT_ID, policyID: POLICY_ID, type: CONST.REPORT.TYPE.EXPENSE},
                [TRANSACTION_VIOLATIONS_KEY]: [snapshotViolation],
            },
        };
        await waitForBatchedUpdatesWithAct();
    });

    it.each([false, true])('only forwards queued action loading while online (offline: %s)', async (isOffline) => {
        // Given a transaction whose report still has a queued payment after cancellation
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {isActionLoading: true});
        jest.mocked(useNetwork).mockReturnValue({isOffline});

        // When the Search transaction row renders
        renderRow();
        await waitForBatchedUpdatesWithAct();

        // Then the shared layout props suppress queued-action loading only offline
        expect(jest.mocked(TransactionListItemNarrow).mock.lastCall?.[0].isActionLoading).toBe(!isOffline);
    });

    it('shows the violations from the search snapshot when they are not in live Onyx', async () => {
        // Given an expense the user never opened, so its violations exist only in the search snapshot

        // When the Search row for that expense renders
        renderRow();
        await waitForBatchedUpdatesWithAct();

        // Then the row still shows the violation returned by the Search API
        expect(screen.getByText(CONST.VIOLATIONS.MISSING_TAG)).toBeTruthy();
    });

    it('prefers the live Onyx violations over the search snapshot', async () => {
        // Given violations in live Onyx, which are fresher than the snapshot (e.g. after opening or editing the expense)
        await Onyx.set(TRANSACTION_VIOLATIONS_KEY, [liveViolation]);

        // When the Search row for that expense renders
        renderRow();
        await waitForBatchedUpdatesWithAct();

        // Then the row shows the live violations instead of the snapshot ones
        expect(screen.getByText(CONST.VIOLATIONS.OVER_LIMIT)).toBeTruthy();
        expect(screen.queryByText(CONST.VIOLATIONS.MISSING_TAG)).toBeNull();
    });

    it('does not initialize report approval confirmation for a transaction row', async () => {
        // Given transaction rows only offer View, so report approval data is unnecessary
        jest.mocked(useConfirmApproveReportViolations).mockClear();

        // When a transaction row with violations renders
        renderRow();
        await waitForBatchedUpdatesWithAct();

        // Then the row does not initialize the report-wide approval hook
        expect(useConfirmApproveReportViolations).not.toHaveBeenCalled();
        expect(screen.getByText(CONST.VIOLATIONS.MISSING_TAG)).toBeTruthy();
    });
});
