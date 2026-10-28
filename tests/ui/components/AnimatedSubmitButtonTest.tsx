/* eslint-disable testing-library/no-unnecessary-act -- DOM Testing Library's fireEvent does not wrap React DOM updates in act. */
import {fireEvent, screen} from '@testing-library/dom';

import AnimatedSubmitButton from '@components/AnimatedSubmitButton';

import CONST from '@src/CONST';

import type {View} from 'react-native';
import type * as Reanimated from 'react-native-reanimated';

import React, {act, useState} from 'react';
import {createRoot} from 'react-dom/client';

// The shared Reanimated mock removes exiting views immediately, hiding this regression.
// Render the real web implementation so it retains exiting views just as the browser does.
jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<typeof Reanimated>('react-native-reanimated/src');
    return {
        ...actual,
        __esModule: true,
        default: {
            ...actual.default,
            View: actual.createAnimatedComponent(jest.requireActual<typeof View>('react-native-web/dist/cjs/exports/View')),
        },
        // Jest does not compile app worklets. Keep the real web hook with explicit dependencies.
        useAnimatedStyle: (updater: Parameters<typeof actual.useAnimatedStyle>[0]) => actual.useAnimatedStyle(updater, [updater]),
    };
});
jest.mock('react-native', () => jest.requireActual<Record<string, unknown>>('react-native-web'));
jest.mock('react-native-reanimated/src/common', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-reanimated/src/common'),
    IS_WEB: true,
    IS_IOS: false,
}));
jest.mock('react-native-reanimated/src/createAnimatedComponent/AnimatedComponent', () =>
    jest.requireActual<Record<string, unknown>>('react-native-reanimated/src/createAnimatedComponent/AnimatedComponent.tsx'),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({expenseAndReportPreviewTextButtonContainer: {gap: 8}})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Send: () => null}),
}));
jest.mock('@userActions/IOU/ReportWorkflow', () => ({
    clearPendingExpenseAction: jest.fn(),
}));
jest.mock('@components/Button', () => ({
    __esModule: true,
    default: Object.assign(
        ({children, isLoading, onPress}: {children: React.ReactNode; isLoading?: boolean; onPress?: () => void}) => (
            <button
                type="button"
                onClick={onPress}
            >
                {isLoading ? 'Submitting' : children}
            </button>
        ),
        {
            Text: ({children}: {children: React.ReactNode}) => children,
            Icon: () => null,
        },
    ),
}));

function CancellableSubmission() {
    const [isSubmitting, setIsSubmitting] = useState(true);

    return (
        <div>
            {isSubmitting ? (
                <AnimatedSubmitButton
                    text="Submit"
                    onPress={() => undefined}
                    isSubmittingAnimationRunning
                    onAnimationFinish={() => setIsSubmitting(false)}
                />
            ) : (
                <button type="button">Submit via PDF</button>
            )}
            <button
                type="button"
                onClick={() => setIsSubmitting(false)}
            >
                Cancel
            </button>
        </div>
    );
}

describe('AnimatedSubmitButton web animations', () => {
    let container: HTMLDivElement;
    let root: ReturnType<typeof createRoot>;

    beforeEach(() => {
        // jsdom has no layout; the exit implementation needs an offset parent to retain its DOM clone.
        jest.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(() => container);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        jest.restoreAllMocks();
    });

    it('removes the loading button immediately when cancellation replaces it with the submit dropdown', async () => {
        // Given an in-progress submission whose header switches back to the dropdown on cancellation
        act(() => root.render(<CancellableSubmission />));
        expect(screen.getByRole('button', {name: 'Submitting'})).toBeTruthy();

        // When the user cancels before PDF generation finishes
        await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Cancel'})));

        // Then the old loading button must not remain beside the restored dropdown during an exit animation
        expect(screen.getByRole('button', {name: 'Submit via PDF'})).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Submitting'})).toBeNull();
        act(() => jest.advanceTimersByTime(CONST.ANIMATION_SUBMIT_DURATION));
        expect(screen.queryByRole('button', {name: 'Submitting'})).toBeNull();
    });
});
