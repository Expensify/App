import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TotalCell from '@components/TransactionItemRow/DataCells/TotalCell';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

// The amount edit input (NumberWithSymbolForm) calls useIsFocused/useNavigation, which need a NavigationContainer
// ancestor we don't render here. Matches the mock pattern in NumberWithSymbolFormTest.tsx.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: () => true,
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency === 'USD' ? '$' : `${currency ?? 'USD'} `}${((amount ?? 0) / 100).toFixed(2)}`,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    }),
}));

// Forces the cell into the "wide/editable" layout branch, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
}));

// EditableCell only shows/enables the edit-pencil button while the cell is hovered (isCellHovered from Hoverable),
// which jsdom can't simulate reliably. Force it hovered so the wrapping View's pointerEvents isn't "none". RNTL
// v13's fireEvent.press respects pointerEvents and silently no-ops when a "none" ancestor blocks the target.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

// Mirrors the mock pattern used in AgentsTableRowTest.tsx to make the pencil button directly pressable.
jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function mockPressableWithFeedback({
        children,
        onPress,
        accessibilityLabel,
    }: {
        children: React.ReactNode | ((state: {hovered: boolean; pressed: boolean}) => React.ReactNode);
        onPress: () => void;
        accessibilityLabel?: string;
    }) {
        const content = typeof children === 'function' ? children({hovered: false, pressed: false}) : children;
        return (
            <TouchableOpacity
                testID="mock-edit-button"
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
            >
                {content}
            </TouchableOpacity>
        );
    }
    return {__esModule: true, default: mockPressableWithFeedback};
});

const MOCK_TRANSACTION_ID = '1';

const createBaseTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    ...createRandomTransaction(1),
    transactionID: MOCK_TRANSACTION_ID,
    currency: CONST.CURRENCY.USD,
    modifiedAmount: undefined,
    ...overrides,
});

const renderTotalCell = (transactionItem: Transaction) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <TotalCell
                transactionItem={transactionItem}
                shouldShowTooltip={false}
                canEdit
                onSave={jest.fn()}
            />
        </ComposeProviders>,
    );
};

describe('TotalCell', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    it('blanks the amount for a failed-scan amount placeholder', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.queryByText('$0.00')).not.toBeOnTheScreen();
    });

    it('shows the formatted amount for a normal transaction', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 1000,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.getByText('$10.00')).toBeOnTheScreen();
    });

    it('does not blank a legitimate manual $0.00 amount', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.getByText('$0.00')).toBeOnTheScreen();
    });

    it('does not blank the amount once the failed-scan placeholder amount is confirmed', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 0,
            modifiedAmount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.getByText('$0.00')).toBeOnTheScreen();
    });

    it('saves when the user types 0 to confirm a failed-scan placeholder amount', async () => {
        const onSave = jest.fn();
        const mockTransaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <TotalCell
                    transactionItem={mockTransaction}
                    shouldShowTooltip={false}
                    canEdit
                    onSave={onSave}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdates();

        fireEvent.press(await screen.findByTestId('mock-edit-button'));
        const input = await screen.findByLabelText('Amount (USD)');

        fireEvent.changeText(input, '0');
        fireEvent(input, 'blur');

        expect(onSave).toHaveBeenCalledWith(0);
    });

    it('does not save when the cell is opened and blurred without typing', async () => {
        const onSave = jest.fn();
        const mockTransaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <TotalCell
                    transactionItem={mockTransaction}
                    shouldShowTooltip={false}
                    canEdit
                    onSave={onSave}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdates();

        fireEvent.press(await screen.findByTestId('mock-edit-button'));
        const input = await screen.findByLabelText('Amount (USD)');

        fireEvent(input, 'blur');

        expect(onSave).not.toHaveBeenCalled();
    });
});
