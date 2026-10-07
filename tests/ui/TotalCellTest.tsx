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

// The amount edit input calls useIsFocused/useNavigation, which need a NavigationContainer ancestor we don't render here.
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

    describe('signed amount editing', () => {
        // A tracked (unreported) expense allows negative amounts and stores its amount with the opposite sign
        const createTrackedTransaction = (displayAmount: number) =>
            createBaseTransaction({
                amount: -displayAmount,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            });

        const renderEditingTotalCell = async (transactionItem: Transaction, onSave: jest.Mock) => {
            render(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <TotalCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={false}
                        canEdit
                        onSave={onSave}
                    />
                </ComposeProviders>,
            );
            await waitForBatchedUpdates();

            fireEvent.press(await screen.findByTestId('mock-edit-button'));
            return screen.findByLabelText('Amount (USD)');
        };

        it('edits the magnitude of a negative amount and shows its sign beside the input', async () => {
            // Given a tracked expense of -$10.00
            const input = await renderEditingTotalCell(createTrackedTransaction(-1000), jest.fn());

            // Then the input holds only the magnitude and the sign is rendered on its own, so the cell reads -$10.00
            expect(input.props.value).toBe('10.00');
            expect(screen.getByText('-')).toBeOnTheScreen();
            expect(screen.getByText('$')).toBeOnTheScreen();
        });

        it('saves a negative amount when the user enters a negative number', async () => {
            // Given a tracked expense of $10.00 being edited
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(1000), onSave);

            // When the user enters a negative amount and leaves the cell
            fireEvent.changeText(input, '-12.50');
            fireEvent(input, 'blur');

            // Then the signed amount is saved in the backend format
            expect(onSave).toHaveBeenCalledWith(-1250);
        });

        it('saves a positive amount when the user removes the sign with backspace at the start', async () => {
            // Given a tracked expense of -$10.00 with the caret at the start of its magnitude
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(-1000), onSave);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // When the user presses backspace and leaves the cell
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});
            fireEvent(input, 'blur');

            // Then the sign is gone and the positive amount is saved
            expect(screen.queryByText('-')).not.toBeOnTheScreen();
            expect(onSave).toHaveBeenCalledWith(1000);
        });

        it('does not save when a negative amount is opened and blurred without changes', async () => {
            // Given a tracked expense of -$10.00 being edited
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(-1000), onSave);

            // When the user leaves the cell without editing
            fireEvent(input, 'blur');

            // Then nothing is saved, because the signed amount is unchanged
            expect(onSave).not.toHaveBeenCalled();
        });

        it('keeps the sign of a negative Split Bill amount, which the user may not flip', async () => {
            // Given a negative Split Bill amount being edited, whose sign the cell shows but does not let the user change
            const onSave = jest.fn();
            const input = await renderEditingTotalCell({...createTrackedTransaction(-1000), comment: {source: CONST.IOU.TYPE.SPLIT}}, onSave);
            expect(screen.getByText('-')).toBeOnTheScreen();

            // When the user types a minus before the magnitude, which would flip a sign the user may change, then changes the magnitude and leaves the cell
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            fireEvent.changeText(input, '-10.00');
            fireEvent.changeText(input, '15.00');
            fireEvent(input, 'blur');

            // Then the minus is rejected and the new magnitude is saved with the original negative sign
            expect(onSave).toHaveBeenCalledWith(-1500);
        });

        it('seeds the edit input empty for a failed-scan amount placeholder', async () => {
            // Given a failed-scan placeholder amount
            const input = await renderEditingTotalCell(
                createBaseTransaction({
                    amount: 0,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
                }),
                jest.fn(),
            );

            // Then the input starts empty instead of showing the placeholder amount
            expect(input.props.value).toBe('');
        });
    });
});
