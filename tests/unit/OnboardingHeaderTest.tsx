import {fireEvent, render, screen} from '@testing-library/react-native';

import OnboardingHeader, {OnboardingHeaderProvider, OnboardingStickyHeader} from '@components/OnboardingHeader';

import React from 'react';
import {Platform} from 'react-native';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useSafeAreaPaddings', () => () => ({
    paddingTop: 0,
    paddingBottom: 0,
}));

jest.mock('@hooks/useViewportOffsetTop', () => () => 0);

type TestFlowProps = {
    step?: number;
    showHeader?: boolean;
    onBackStep1?: () => void;
    onBackStep2?: () => void;
    shouldShowBackButtonStep2?: boolean;
};

function TestFlow({step = 1, showHeader = true, onBackStep1, onBackStep2, shouldShowBackButtonStep2 = true}: TestFlowProps) {
    return (
        <OnboardingHeaderProvider>
            {showHeader && (
                <>
                    {step === 1 && <OnboardingHeader onBackButtonPress={onBackStep1} />}
                    {step === 2 && (
                        <OnboardingHeader
                            onBackButtonPress={onBackStep2}
                            shouldShowBackButton={shouldShowBackButtonStep2}
                        />
                    )}
                </>
            )}
            <OnboardingStickyHeader />
        </OnboardingHeaderProvider>
    );
}

function getStickyBackButton() {
    return screen.getByLabelText('common.back');
}

function queryStickyBackButton() {
    return screen.queryByLabelText('common.back');
}

describe('OnboardingHeader', () => {
    it('swaps registered onBackButtonPress when moving to the next step', () => {
        const onBackStep1 = jest.fn();
        const onBackStep2 = jest.fn();

        const {rerender} = render(
            <TestFlow
                step={1}
                onBackStep1={onBackStep1}
                onBackStep2={onBackStep2}
            />,
        );

        // In step 1, pressing the sticky Back button should trigger step 1 callback
        const backButtonStep1 = getStickyBackButton();
        expect(backButtonStep1).toBeDefined();
        if (backButtonStep1) {
            fireEvent.press(backButtonStep1);
        }
        expect(onBackStep1).toHaveBeenCalledTimes(1);
        expect(onBackStep2).not.toHaveBeenCalled();

        // Move to step 2
        rerender(
            <TestFlow
                step={2}
                onBackStep1={onBackStep1}
                onBackStep2={onBackStep2}
            />,
        );

        // In step 2, pressing the sticky Back button should trigger step 2 callback, not step 1
        const backButtonStep2 = getStickyBackButton();
        expect(backButtonStep2).toBeDefined();
        if (backButtonStep2) {
            fireEvent.press(backButtonStep2);
        }
        expect(onBackStep1).toHaveBeenCalledTimes(1);
        expect(onBackStep2).toHaveBeenCalledTimes(1);
    });

    it('hides the sticky back button when moving to a step with shouldShowBackButton false', () => {
        const onBackStep = jest.fn();

        const {rerender} = render(
            <TestFlow
                step={1}
                onBackStep1={onBackStep}
            />,
        );

        expect(queryStickyBackButton()).not.toBeNull();

        // Move to step 2 where shouldShowBackButton is false
        rerender(
            <TestFlow
                step={2}
                shouldShowBackButtonStep2={false}
            />,
        );

        expect(queryStickyBackButton()).toBeNull();
    });

    it('resets header state to default when unmounted', () => {
        const onBackStep = jest.fn();

        const {rerender} = render(
            <TestFlow
                step={1}
                showHeader
                onBackStep1={onBackStep}
            />,
        );

        expect(queryStickyBackButton()).not.toBeNull();

        // Unmount header
        rerender(<TestFlow showHeader={false} />);

        expect(queryStickyBackButton()).toBeNull();
    });

    describe('on web', () => {
        const originalOS = Platform.OS;

        beforeEach(() => {
            Platform.OS = 'web';
        });

        afterEach(() => {
            Platform.OS = originalOS;
        });

        it('renders accessible in-screen header and hides sticky header with aria-hidden', () => {
            const onBackStep = jest.fn();

            render(
                <TestFlow
                    step={1}
                    onBackStep1={onBackStep}
                />,
            );

            // On web, the sticky header is hidden from screen readers via aria-hidden
            const visibleBackButtons = screen.getAllByLabelText('common.back');
            expect(visibleBackButtons).toHaveLength(1);

            // The hidden sticky header exists with aria-hidden and tabIndex = -1
            const allBackButtons = screen.getAllByLabelText('common.back', {includeHiddenElements: true});
            expect(allBackButtons).toHaveLength(2);
            const stickyButton = allBackButtons.find((el) => el.props.tabIndex === -1);
            expect(stickyButton).toBeDefined();

            // Pressing the in-screen back button triggers onBackStep
            const firstVisibleButton = visibleBackButtons.at(0);
            expect(firstVisibleButton).toBeDefined();
            if (firstVisibleButton) {
                fireEvent.press(firstVisibleButton);
            }
            expect(onBackStep).toHaveBeenCalledTimes(1);
        });
    });
});
