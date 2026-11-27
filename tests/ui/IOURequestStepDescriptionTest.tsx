import {act, render} from '@testing-library/react-native';

import InputWrapper from '@components/Form/InputWrapper';

import IOURequestStepDescription from '@pages/iou/request/step/DynamicIOURequestStepDescription';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/**
 * These tests pin the exact arguments passed to `focusComposerWithDelay` from the discard-modal `onCancel` handler
 * in `IOURequestStepDescription`. The third `forceKeyboardIfAlreadyFocused` argument is now resolved by the
 * platform-split `shouldForceKeyboardIfAlreadyFocused` helper (true on iOS, false on Android/web), because forcing
 * a re-focus is the fix on iOS but the reported regression on Android. This flow cannot be verified manually in
 * dev/simulator, so these assertions are the regression net: they fail loudly if the argument is ever hardcoded
 * again or the helper is bypassed.
 */

// Capture the inner focus function so we can assert the exact args the component invokes it with.
const mockFocusFn = jest.fn();
jest.mock('@libs/focusComposerWithDelay', () => ({
    __esModule: true,
    default: () => mockFocusFn,
}));

// The component gates `forceKeyboardIfAlreadyFocused` behind this platform-resolved helper. Mock it so each test
// can drive the platform's value and assert the component forwards it verbatim.
const mockShouldForceKeyboard = jest.fn(() => false);
jest.mock('@libs/shouldForceKeyboardIfAlreadyFocused', () => ({
    __esModule: true,
    default: () => mockShouldForceKeyboard(),
}));

// Capture the `onCancel` the component wires into the discard-changes hook, without dragging in the real
// navigation/modal machinery (that flow is covered by tests/unit/hooks/useDiscardChangesConfirmationNative.test.ts).
let capturedOnCancel: (() => void) | undefined;
jest.mock('@hooks/useDiscardChangesConfirmation', () => ({
    __esModule: true,
    default: (options: {onCancel?: () => void}) => {
        capturedOnCancel = options.onCancel;
        return {suppressDiscardPrompt: jest.fn()};
    },
}));

// The "OrNotFound" HOCs gate rendering on Onyx report/transaction data that is irrelevant to this wiring test.
// Stub them to pass-through so the real component body runs directly.
jest.mock('@pages/iou/request/step/withWritableReportOrNotFound', () => (Component: React.ComponentType) => Component);
let mockTransaction: Transaction | undefined;
jest.mock(
    '@pages/iou/request/step/withFullTransactionOrNotFound',
    () => (Component: React.ComponentType<{transaction?: Transaction}>) => (props: React.ComponentProps<typeof IOURequestStepDescription>) => (
        <Component
            {...props}
            transaction={mockTransaction}
        />
    ),
);

// Keep navigation and form machinery out of these tests while retaining the input's initial value
jest.mock(
    '@pages/iou/request/step/StepScreenWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/Form/FormProvider',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useAutoFocusInput', () => ({
    __esModule: true,
    default: () => ({inputCallbackRef: jest.fn(), inputRef: {current: null}}),
}));

const ROUTE = createMock<React.ComponentProps<typeof IOURequestStepDescription>['route']>({
    key: 'Dynamic_Money_Request_Step_Description-test',
    name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESCRIPTION,
    params: {
        action: CONST.IOU.ACTION.CREATE,
        iouType: CONST.IOU.TYPE.SUBMIT,
        reportID: 'report-1',
        transactionID: 'txn-1',
    },
});
const NAVIGATION = createMock<React.ComponentProps<typeof IOURequestStepDescription>['navigation']>({});

describe('IOURequestStepDescription - initial description', () => {
    afterEach(() => {
        mockTransaction = undefined;
    });

    it.each([
        [12345, '12345'],
        [0, '0'],
        [undefined, ''],
        [null, ''],
        ['<strong>Lunch</strong>', '*Lunch*'],
    ])('normalizes existing description %j before converting it to markdown', async (description, expected) => {
        // Given an existing expense can have a numeric API description despite the declared string type
        mockTransaction = Object.assign(createMock<Transaction>({transactionID: 'txn-1'}), {comment: {comment: description}});
        const route = {...ROUTE, params: {...ROUTE.params, action: CONST.IOU.ACTION.EDIT}};

        // When the description editor opens
        render(
            <IOURequestStepDescription
                route={route}
                navigation={NAVIGATION}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the input receives markdown text without a parser error
        expect(InputWrapper).toHaveBeenLastCalledWith(expect.objectContaining({defaultValue: expected}), undefined);
    });

    it('normalizes a draft description before filling the input', async () => {
        // Given draft descriptions are already markdown and should only be normalized
        mockTransaction = Object.assign(createMock<Transaction>({transactionID: 'txn-1'}), {comment: {comment: 0}});

        // When the draft description editor opens
        render(
            <IOURequestStepDescription
                route={ROUTE}
                navigation={NAVIGATION}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then numeric zero remains visible rather than an empty input
        expect(InputWrapper).toHaveBeenLastCalledWith(expect.objectContaining({defaultValue: '0'}), undefined);
    });

    it('normalizes the split draft description instead of using the original transaction', async () => {
        // Given an edited split has its own numeric description
        mockTransaction = createMock<Transaction>({transactionID: 'txn-1', comment: {comment: 'Original'}});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}txn-1`, Object.assign(createMock<Transaction>({...mockTransaction}), {comment: {comment: 12345}}));
        });
        const route = {...ROUTE, params: {...ROUTE.params, action: CONST.IOU.ACTION.EDIT, iouType: CONST.IOU.TYPE.SPLIT_EXPENSE}};

        // When the split description editor opens
        render(
            <IOURequestStepDescription
                route={route}
                navigation={NAVIGATION}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the split's normalized text takes precedence
        expect(InputWrapper).toHaveBeenLastCalledWith(expect.objectContaining({defaultValue: '12345'}), undefined);
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}txn-1`, null));
    });
});

describe('IOURequestStepDescription - discard modal onCancel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedOnCancel = undefined;
    });

    it('forces the soft keyboard on cancel when the platform helper opts in (iOS)', async () => {
        mockShouldForceKeyboard.mockReturnValue(true);

        render(
            <IOURequestStepDescription
                route={ROUTE}
                navigation={NAVIGATION}
            />,
        );
        // Let the component's useOnyx subscriptions settle so their updates don't fire outside act().
        await waitForBatchedUpdatesWithAct();

        // The component must have wired an onCancel handler into the discard-changes hook.
        expect(capturedOnCancel).toBeDefined();

        act(() => capturedOnCancel?.());

        // iOS: shouldDelay=true, no forced selection range, forceKeyboardIfAlreadyFocused=true (the #97823 fix).
        expect(mockFocusFn).toHaveBeenCalledWith(true, undefined, true);
    });

    it('does not force the soft keyboard on cancel when the platform helper opts out (Android/web)', async () => {
        mockShouldForceKeyboard.mockReturnValue(false);

        render(
            <IOURequestStepDescription
                route={ROUTE}
                navigation={NAVIGATION}
            />,
        );
        // Let the component's useOnyx subscriptions settle so their updates don't fire outside act().
        await waitForBatchedUpdatesWithAct();

        expect(capturedOnCancel).toBeDefined();

        act(() => capturedOnCancel?.());

        // Android/web: forceKeyboardIfAlreadyFocused=false, argument-identical to pre-#97823 main, so the Android
        // regression (focus without keyboard on the hardware-back path) is removed.
        expect(mockFocusFn).toHaveBeenCalledWith(true, undefined, false);
    });
});
