import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {MobileSelectionMenuModalWrapperProps} from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';
import type {MoneyRequestReportTransactionListController} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import MoneyRequestReportTransactionList from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type * as SearchContext from '@components/Search/SearchContext';

import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StableReport} from '@src/selectors/Report';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockMenuProps: MobileSelectionMenuModalWrapperProps | undefined;

// The real menu is covered by MobileSelectionMenuModalWrapperTest. Here it only records the props the global stack
// passes it, so the test can answer the menu the way the user would.
jest.mock('@components/Modal/Global/MobileSelectionMenuModalWrapper', () => ({
    __esModule: true,
    default: (props: MobileSelectionMenuModalWrapperProps) => {
        mockMenuProps = props;
        return null;
    },
}));

jest.mock('@libs/actions/MobileSelectionMode', () => ({
    turnOnMobileSelectionMode: jest.fn(),
}));

const mockSelection = {isMobileSelectionModeEnabled: false, toggleTransaction: jest.fn()};
jest.mock('@components/MoneyRequestReportView/useMoneyRequestReportTransactionSelection', () => ({
    __esModule: true,
    default: () => ({
        isMobileSelectionModeEnabled: mockSelection.isMobileSelectionModeEnabled,
        toggleTransaction: mockSelection.toggleTransaction,
        isTransactionSelected: () => false,
        groupSelectionState: new Map(),
        toggleGroupSelection: () => {},
        selectableTransactionIDs: [],
        toggleAll: () => {},
    }),
}));

// Each row only records the long-press handler the list hands it, so the test can long press a row by its ID.
const mockLongPressHandlers = new Map<string, (transactionID: string) => void>();
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportTransactionItem', () => ({
    __esModule: true,
    default: ({transactionID, handleLongPress}: {transactionID: string; handleLongPress: (transactionID: string) => void}) => {
        mockLongPressHandlers.set(transactionID, handleLongPress);
        return null;
    },
}));

// The unified list is a FlashList. Here it renders every transaction row through the controller so the rows above
// receive their handlers.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportUnifiedList', () => ({
    __esModule: true,
    default: ({controller}: {controller: MoneyRequestReportTransactionListController}) => {
        const mockReact = jest.requireActual<typeof React>('react');
        return controller.transactionListItems.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key -- the mocked list renders a fixed set of rows
            <mockReact.Fragment key={index}>{controller.renderTransactionListItem(item, {isFirst: index === 0, isLast: false})}</mockReact.Fragment>
        ));
    },
}));

const mockLayout = {isSmallScreenWidth: true};
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({
        shouldUseNarrowLayout: mockLayout.isSmallScreenWidth,
        isSmallScreenWidth: mockLayout.isSmallScreenWidth,
        isMediumScreenWidth: false,
        isLargeScreenWidth: !mockLayout.isSmallScreenWidth,
        isExtraLargeScreenWidth: false,
        onboardingIsMediumOrLargerScreenWidth: !mockLayout.isSmallScreenWidth,
    }),
}));

jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: true}),
}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual() returns the real module for partial mocking
    const actualNavigation = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- returning the real module plus a few overridden hooks is the standard Jest partial-mock pattern
    return {
        ...actualNavigation,
        useIsFocused: () => true,
        useFocusEffect: () => {},
        findFocusedRoute: () => undefined,
    };
});

jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof SearchContext>('@components/Search/SearchContext'),
    useSearchSelectionContext: () => ({selectedTransactionIDs: []}),
    useSearchSelectionActions: () => ({setSelectedTransactions: () => {}, clearSelectedTransactions: () => {}}),
}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: jest.fn(), unmarkReportRHPWidth: jest.fn()}),
    useWideRHPState: () => ({superWideRHPRouteKeys: [], wideRHPRouteKeys: []}),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
    usePersonalDetails: () => ({}),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: 'a@b.com', accountID: 1}),
}));

const REPORT_ID = 'report1';
const FIRST_TRANSACTION_ID = 't1';
const SECOND_TRANSACTION_ID = 't2';

function buildTransaction(transactionID: string, index: number): Transaction {
    return {...createRandomTransaction(index), transactionID, reportID: REPORT_ID, currency: 'USD', amount: -1000};
}

function renderTransactionList() {
    const report = {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        currency: 'USD',
        ownerAccountID: 1,
    } as StableReport;

    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, ModalProvider]}>
            <MoneyRequestReportTransactionList
                report={report}
                transactions={[buildTransaction(FIRST_TRANSACTION_ID, 0), buildTransaction(SECOND_TRANSACTION_ID, 1)]}
                newTransactions={[]}
                reportActions={[]}
                hasComments={false}
                visibleReportActions={[]}
                renderReportAction={() => <View />}
                reportActionsExtraData={undefined}
                linkedReportActionID={undefined}
                listRef={null}
                accessibilityLabel="transactions"
                onListLayout={jest.fn()}
                onScroll={jest.fn()}
                onScrollBeginDrag={jest.fn()}
                onContentSizeChange={jest.fn()}
                onViewableItemsChanged={jest.fn()}
                onEndReached={jest.fn()}
                onStartReached={jest.fn()}
                contentContainerStyle={undefined}
                isLoadingInitialActions={false}
            />
        </ComposeProviders>,
    );
}

async function longPress(transactionID: string) {
    await act(async () => {
        mockLongPressHandlers.get(transactionID)?.(transactionID);
        await waitForBatchedUpdates();
    });
}

async function answerMenu(action: typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE) {
    await act(async () => {
        mockMenuProps?.closeModal({action});
        await waitForBatchedUpdates();
    });
}

describe('MoneyRequestReportTransactionList - long press', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockMenuProps = undefined;
        mockLongPressHandlers.clear();
        mockSelection.isMobileSelectionModeEnabled = false;
        mockSelection.toggleTransaction.mockClear();
        mockLayout.isSmallScreenWidth = true;
        jest.mocked(turnOnMobileSelectionMode).mockClear();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await waitForBatchedUpdates();
    });

    it('opens the global "Select" menu and selects the pressed expense once the user picks "Select"', async () => {
        // Given a narrow report that is not in selection mode yet
        renderTransactionList();
        await waitForBatchedUpdates();

        // When the user long presses the second expense
        await longPress(SECOND_TRANSACTION_ID);

        // Then the global "Select" menu opens with the Report Sentry label, and nothing is selected yet
        expect(mockMenuProps?.sentryLabel).toBe(CONST.SENTRY_LABEL.REPORT.SELECTION_MODE_MENU_ITEM);
        expect(turnOnMobileSelectionMode).not.toHaveBeenCalled();
        expect(mockSelection.toggleTransaction).not.toHaveBeenCalled();

        // When the user picks "Select"
        await answerMenu(ModalActions.CONFIRM);

        // Then selection mode turns on and the expense that was long pressed is the one selected
        expect(turnOnMobileSelectionMode).toHaveBeenCalledTimes(1);
        expect(mockSelection.toggleTransaction).toHaveBeenCalledTimes(1);
        expect(mockSelection.toggleTransaction).toHaveBeenCalledWith(SECOND_TRANSACTION_ID, undefined);
    });

    it('leaves selection untouched when the user dismisses the menu', async () => {
        // Given an open menu for a long-pressed expense
        renderTransactionList();
        await waitForBatchedUpdates();
        await longPress(FIRST_TRANSACTION_ID);

        // When the user dismisses it without picking "Select"
        await answerMenu(ModalActions.CLOSE);

        // Then selection mode stays off and no expense is selected
        expect(turnOnMobileSelectionMode).not.toHaveBeenCalled();
        expect(mockSelection.toggleTransaction).not.toHaveBeenCalled();
    });

    it('toggles the expense directly without opening the menu when selection mode is already on', async () => {
        // Given a report already in selection mode
        mockSelection.isMobileSelectionModeEnabled = true;
        renderTransactionList();
        await waitForBatchedUpdates();

        // When the user long presses an expense
        await longPress(FIRST_TRANSACTION_ID);

        // Then the expense is toggled straight away, because the menu only exists to enter selection mode
        expect(mockMenuProps).toBeUndefined();
        expect(mockSelection.toggleTransaction).toHaveBeenCalledWith(FIRST_TRANSACTION_ID, undefined);
        expect(turnOnMobileSelectionMode).not.toHaveBeenCalled();
    });

    it('does not open the menu on a wide layout', async () => {
        // Given a wide layout, where long press is not a selection affordance
        mockLayout.isSmallScreenWidth = false;
        renderTransactionList();
        await waitForBatchedUpdates();

        // When the user long presses an expense
        await longPress(FIRST_TRANSACTION_ID);

        // Then no menu opens and nothing is selected
        expect(mockMenuProps).toBeUndefined();
        expect(mockSelection.toggleTransaction).not.toHaveBeenCalled();
    });
});
