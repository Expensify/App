import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnboardingHeader, {OnboardingHeaderProvider, OnboardingStickyHeader} from '@components/OnboardingHeader';

import React, {useState} from 'react';

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

describe('OnboardingHeader', () => {
    it('swaps registered onBackButtonPress when moving to the next step', () => {
        const onBackStep1 = jest.fn();
        const onBackStep2 = jest.fn();

        let setStepCallback: (step: number) => void = () => {};

        function TestFlow() {
            const [step, setStep] = useState(1);
            setStepCallback = setStep;

            return (
                <OnboardingHeaderProvider>
                    <OnboardingStickyHeader />
                    {step === 1 && <OnboardingHeader onBackButtonPress={onBackStep1} />}
                    {step === 2 && <OnboardingHeader onBackButtonPress={onBackStep2} />}
                </OnboardingHeaderProvider>
            );
        }

        render(<TestFlow />);

        // In step 1, pressing Back should trigger step 1 callback
        const backButtonStep1 = screen.getAllByLabelText('common.back').at(0);
        expect(backButtonStep1).toBeDefined();
        if (backButtonStep1) {
            fireEvent.press(backButtonStep1);
        }
        expect(onBackStep1).toHaveBeenCalledTimes(1);
        expect(onBackStep2).not.toHaveBeenCalled();

        // Move to step 2
        act(() => {
            setStepCallback(2);
        });

        // In step 2, pressing Back should trigger step 2 callback, not step 1
        const backButtonStep2 = screen.getAllByLabelText('common.back').at(0);
        expect(backButtonStep2).toBeDefined();
        if (backButtonStep2) {
            fireEvent.press(backButtonStep2);
        }
        expect(onBackStep1).toHaveBeenCalledTimes(1);
        expect(onBackStep2).toHaveBeenCalledTimes(1);
    });

    it('hides the back button when moving to a step with shouldShowBackButton false', () => {
        const onBackStep = jest.fn();
        let setStepCallback: (step: number) => void = () => {};

        function TestFlow() {
            const [step, setStep] = useState(1);
            setStepCallback = setStep;

            return (
                <OnboardingHeaderProvider>
                    <OnboardingStickyHeader />
                    {step === 1 && <OnboardingHeader onBackButtonPress={onBackStep} />}
                    {step === 2 && <OnboardingHeader shouldShowBackButton={false} />}
                </OnboardingHeaderProvider>
            );
        }

        render(<TestFlow />);

        expect(screen.queryAllByLabelText('common.back')).not.toHaveLength(0);

        // Move to step 2 where shouldShowBackButton is false
        act(() => {
            setStepCallback(2);
        });

        expect(screen.queryAllByLabelText('common.back')).toHaveLength(0);
    });

    it('resets header state to default when unmounted', () => {
        const onBackStep = jest.fn();
        let setShowHeaderCallback: (show: boolean) => void = () => {};

        function TestFlow() {
            const [showHeader, setShowHeader] = useState(true);
            setShowHeaderCallback = setShowHeader;

            return (
                <OnboardingHeaderProvider>
                    <OnboardingStickyHeader />
                    {showHeader && <OnboardingHeader onBackButtonPress={onBackStep} />}
                </OnboardingHeaderProvider>
            );
        }

        render(<TestFlow />);

        expect(screen.queryAllByLabelText('common.back')).not.toHaveLength(0);

        // Unmount header
        act(() => {
            setShowHeaderCallback(false);
        });

        expect(screen.queryAllByLabelText('common.back')).toHaveLength(0);
    });
});
