import {act, render} from '@testing-library/react-native';

import IOURequestStepDescription from '@pages/iou/request/step/DynamicIOURequestStepDescription';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import React from 'react';

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
jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (Component: React.ComponentType) => Component);

// The JSX children are irrelevant here — the `onCancel` closure is created in the component body before render.
// Stubbing them keeps the render trivial and stable.
jest.mock('@pages/iou/request/step/StepScreenWrapper', () => () => null);
jest.mock('@components/Form/FormProvider', () => () => null);
jest.mock('@components/Form/InputWrapper', () => () => null);

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
