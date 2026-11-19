import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TotalCell from '@components/TransactionItemRow/DataCells/TotalCell';

import {convertToBackendAmount} from '@libs/CurrencyUtils';
import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

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

// The flip button is only rendered on touch devices. The no-touchscreen case lives in TotalCellWithoutTouchScreenTest.tsx.
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
}));

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

// The keyboard shortcut manager listens for real key events, which the test renderer never dispatches, so the cell's
// active Escape handler is captured to be invoked directly.
let mockEscapeShortcutHandler: (() => void) | undefined;
jest.mock('@hooks/useKeyboardShortcut', () => ({
    __esModule: true,
    default: (shortcut: {shortcutKey: string}, callback: () => void, config: {isActive?: boolean} = {}) => {
        if (shortcut.shortcutKey !== 'Escape') {
            return;
        }
        mockEscapeShortcutHandler = config.isActive ? callback : undefined;
    },
}));

// Forces the cell into the "wide/editable" layout branch, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
    useIsDisplayedInWideRHP: () => false,
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
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

        const createEditableTotalCell = (transactionItem: Transaction, onSave: jest.Mock) => (
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <TotalCell
                    transactionItem={transactionItem}
                    shouldShowTooltip={false}
                    canEdit
                    onSave={onSave}
                />
            </ComposeProviders>
        );

        const renderEditingTotalCell = async (transactionItem: Transaction, onSave: jest.Mock) => {
            render(createEditableTotalCell(transactionItem, onSave));
            await waitForBatchedUpdates();

            fireEvent.press(await screen.findByTestId('mock-edit-button'));
            return screen.findByLabelText(/^\u2212?Amount \(USD\)$/);
        };

        it('edits the magnitude of a negative amount and shows its sign beside the input', async () => {
            // Given a tracked expense of -$10.00
            const transaction = createTrackedTransaction(-1000);

            // When the cell is opened for editing
            const input = await renderEditingTotalCell(transaction, jest.fn());

            // Then the input holds only the magnitude and the sign is rendered on its own, so the cell reads -$10.00
            expect(input.props.value).toBe('10.00');
            expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();
            expect(screen.getByText('$', {includeHiddenElements: true})).toBeOnTheScreen();

            // And the sign and symbol are hidden from assistive tech, since the input's label carries both
            expect(input.props.accessibilityLabel).toBe('\u2212Amount (USD)');
            expect(screen.queryByText('-')).not.toBeOnTheScreen();
            expect(screen.queryByText('$')).not.toBeOnTheScreen();
        });

        it('saves a positive amount when the user removes the sign with backspace at the start', async () => {
            // Given a tracked expense of -$10.00 with the caret at the start of its magnitude
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(-1000), onSave);
            expect(input.props.accessibilityLabel).toBe('\u2212Amount (USD)');
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // When the user presses backspace
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});

            // Then the accessible label is updated and the sign is removed from the UI
            expect(input.props.accessibilityLabel).toBe('Amount (USD)');
            expect(screen.queryByText('-', {includeHiddenElements: true})).not.toBeOnTheScreen();

            // When the user leaves the cell
            fireEvent(input, 'blur');

            // Then the positive amount is saved
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
            expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();

            // When the user types a minus before the magnitude, which would flip a sign the user may change
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            fireEvent.changeText(input, '-10.00');

            // Then the minus is rejected and the magnitude is unchanged
            expect(input.props.value).toBe('10.00');

            // When the user changes the magnitude and leaves the cell
            fireEvent.changeText(input, '15.00');
            fireEvent(input, 'blur');

            // Then the new magnitude is saved with the original negative sign
            expect(onSave).toHaveBeenCalledWith(-1500);
        });

        it('updates the amount and sign when an external update arrives before the user starts typing', async () => {
            // Given a negative Split Bill amount being edited
            const onSave = jest.fn();
            const createSplitTransaction = (displayAmount: number) => ({...createTrackedTransaction(displayAmount), comment: {source: CONST.IOU.TYPE.SPLIT}});
            const input = await renderEditingTotalCell(createSplitTransaction(-1000), onSave);
            expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();

            // When a positive amount arrives while the cell is open and the user has not typed yet
            screen.rerender(createEditableTotalCell(createSplitTransaction(500), onSave));
            await waitForBatchedUpdates();

            // Then the input updates to the new amount and drops the fixed negative sign
            expect(input.props.value).toBe('5.00');
            expect(screen.queryByText('-', {includeHiddenElements: true})).not.toBeOnTheScreen();
            expect(input.props.accessibilityLabel).toBe('Amount (USD)');

            // When the user edits the amount and leaves the cell
            fireEvent.changeText(input, '12');
            fireEvent(input, 'blur');

            // Then the positive amount is saved without re-adding the negative sign
            expect(onSave).toHaveBeenCalledWith(1200);
        });

        it('keeps the sign and draft of a negative Split Bill amount when an external update arrives mid-edit', async () => {
            // Given a negative Split Bill amount being edited where the user has already typed a draft
            const onSave = jest.fn();
            const createSplitTransaction = (displayAmount: number) => ({...createTrackedTransaction(displayAmount), comment: {source: CONST.IOU.TYPE.SPLIT}});
            const input = await renderEditingTotalCell(createSplitTransaction(-1000), onSave);

            // When the user edits the magnitude
            fireEvent.changeText(input, '12');

            // And a positive amount arrives from elsewhere while the draft is in progress
            screen.rerender(createEditableTotalCell(createSplitTransaction(500), onSave));
            await waitForBatchedUpdates();

            // Then the draft and its negative sign are kept
            expect(input.props.value).toBe('12');
            expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();

            // When the user leaves the cell
            fireEvent(input, 'blur');

            // Then the draft is saved with the locked negative sign
            expect(onSave).toHaveBeenCalledWith(-1200);
        });

        it('updates the amount and sign from an external update that arrived mid-edit once the user reverts the draft', async () => {
            // Given a negative Split Bill amount being edited where the user has already typed a draft that a newer amount arrived over
            const onSave = jest.fn();
            const createSplitTransaction = (displayAmount: number) => ({...createTrackedTransaction(displayAmount), comment: {source: CONST.IOU.TYPE.SPLIT}});
            const input = await renderEditingTotalCell(createSplitTransaction(-1000), onSave);
            fireEvent.changeText(input, '12');

            screen.rerender(createEditableTotalCell(createSplitTransaction(500), onSave));
            await waitForBatchedUpdates();

            // When the user reverts the draft to the amount the editor opened with
            fireEvent.changeText(input, '10.00');
            await waitForBatchedUpdates();

            // Then the input takes the newer amount over, because there is no longer a draft to keep
            expect(input.props.value).toBe('5.00');
            expect(screen.queryByText('-', {includeHiddenElements: true})).not.toBeOnTheScreen();

            // When the user leaves the cell
            fireEvent(input, 'blur');

            // Then nothing is saved over the newer amount
            expect(onSave).not.toHaveBeenCalled();
        });

        it('clears the sign when the whole magnitude is replaced with a new number', async () => {
            // Given a tracked expense of -$10.00 with its whole magnitude selected
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(-1000), onSave);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 5}}});

            // When the user types a number over the selection and leaves the cell
            fireEvent.changeText(input, '5');
            fireEvent(input, 'blur');

            // Then the typed number replaces the whole amount, sign included, as in the full-screen amount editor
            expect(screen.queryByText('-', {includeHiddenElements: true})).not.toBeOnTheScreen();
            expect(onSave).toHaveBeenCalledWith(500);
        });

        it('discards the edit of a negative amount on Escape', async () => {
            // Given a tracked expense of -$10.00 whose magnitude the user changed
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(-1000), onSave);
            fireEvent.changeText(input, '15.00');

            // When the user presses Escape
            act(() => mockEscapeShortcutHandler?.());

            // Then the cell leaves edit mode without saving the draft
            expect(screen.queryByLabelText(/^\u2212?Amount \(USD\)$/)).not.toBeOnTheScreen();
            expect(onSave).not.toHaveBeenCalled();
        });

        it('seeds the edit input empty for a failed-scan amount placeholder', async () => {
            // Given a failed-scan placeholder amount
            const transaction = createBaseTransaction({
                amount: 0,
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
            });

            // When the cell is opened for editing
            const input = await renderEditingTotalCell(transaction, jest.fn());

            // Then the input starts empty instead of showing the placeholder amount
            expect(input.props.value).toBe('');
        });

        it('saves the amount and closes the editor when the user submits with Enter', async () => {
            // Given a tracked expense of $10.00 being edited
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(1000), onSave);

            // When the user enters a new amount and submits with Enter
            fireEvent.changeText(input, '15.00');
            fireEvent(input, 'submitEditing');

            // Then the new amount is saved and the cell exits edit mode
            expect(onSave).toHaveBeenCalledWith(1500);
            expect(screen.queryByLabelText(/^\u2212?Amount \(USD\)$/)).not.toBeOnTheScreen();
        });

        it.each([
            {displayAmount: 1000, expectedLabel: '\u2212Amount (USD)', shouldShowSign: true, expectedSavedAmount: -1000},
            {displayAmount: -1000, expectedLabel: 'Amount (USD)', shouldShowSign: false, expectedSavedAmount: 1000},
        ])('saves $expectedSavedAmount when the user flips an amount of $displayAmount on a touch device', async ({displayAmount, expectedLabel, shouldShowSign, expectedSavedAmount}) => {
            // Given a tracked expense being edited, on a device whose soft keyboard has no minus key
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(displayAmount), onSave);

            // When the user presses the flip button
            fireEvent.press(screen.getByLabelText('Flip'));

            // Then the sign is toggled in the input's accessible label and in the UI
            expect(input.props.accessibilityLabel).toBe(expectedLabel);
            if (shouldShowSign) {
                expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();
            } else {
                expect(screen.queryByText('-', {includeHiddenElements: true})).not.toBeOnTheScreen();
            }

            // When the user leaves the cell
            fireEvent(input, 'blur');

            // Then the flipped amount is saved in the backend format
            expect(onSave).toHaveBeenCalledWith(expectedSavedAmount);
        });

        it('preserves the flipped sign when the user changes the magnitude on a touch device', async () => {
            // Given a tracked expense of $10.00 being edited
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(1000), onSave);

            // When the user flips the sign
            fireEvent.press(screen.getByLabelText('Flip'));

            // Then the negative sign is displayed
            expect(input.props.accessibilityLabel).toBe('\u2212Amount (USD)');
            expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();

            // When the user changes the magnitude and submits with Enter
            fireEvent.changeText(input, '12.50');
            fireEvent(input, 'submitEditing');

            // Then the flipped sign is kept on the new magnitude
            expect(onSave).toHaveBeenCalledWith(-1250);
        });

        it('does not render the flip button for a Split Bill, whose sign the user may not change', async () => {
            // Given a Split Bill on a touch device
            const splitTransaction = {...createTrackedTransaction(1000), comment: {source: CONST.IOU.TYPE.SPLIT}};

            // When the cell is opened for editing
            await renderEditingTotalCell(splitTransaction, jest.fn());

            // Then there is no way to flip the sign
            expect(screen.queryByLabelText('Flip')).not.toBeOnTheScreen();
        });

        it('saves the maximum allowed amount exactly', async () => {
            // Given a tracked expense of $10.00 being edited
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(1000), onSave);

            // When the user types an amount with the maximum 10 integer digits and 2 decimals
            fireEvent.changeText(input, '9999999999.99');

            // When the user leaves the cell
            fireEvent(input, 'blur');

            // Then the full amount is saved without losing any digit
            expect(onSave).toHaveBeenCalledWith(convertToBackendAmount(9999999999.99));
        });

        it('rejects an 11th integer digit', async () => {
            // Given a tracked expense being edited with the maximum 10 integer digits
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(1000), onSave);
            fireEvent.changeText(input, '9999999999');

            // When the user types one more integer digit
            fireEvent.changeText(input, '99999999999');

            // Then the extra digit is ignored, so the amount stays within the limit the long-amount layout is built for
            expect(input.props.value).toBe('9999999999');

            // And leaving the cell saves the amount without it
            fireEvent(input, 'blur');
            expect(onSave).toHaveBeenCalledWith(convertToBackendAmount(9999999999));
        });

        it('saves a long negative amount with its sign', async () => {
            // Given a tracked expense of $10.00 being edited, which allows negative amounts
            const onSave = jest.fn();
            const input = await renderEditingTotalCell(createTrackedTransaction(1000), onSave);
            expect(input.props.accessibilityLabel).toBe('Amount (USD)');

            fireEvent.changeText(input, '-9999999999.99');
            expect(input.props.accessibilityLabel).toBe('\u2212Amount (USD)');
            fireEvent.changeText(input, '-9999999999.99');

            // Then the input holds only the magnitude, and the sign is rendered beside it, not inside it
            expect(input.props.value).toBe('9999999999.99');
            expect(screen.getByText('-', {includeHiddenElements: true})).toBeOnTheScreen();

            // And leaving the cell saves the signed amount in the backend format
            fireEvent(input, 'blur');
            expect(onSave).toHaveBeenCalledWith(convertToBackendAmount(-9999999999.99));
        });
    });
});
