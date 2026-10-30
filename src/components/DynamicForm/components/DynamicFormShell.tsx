import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScreenWrapper from '@components/ScreenWrapper';

import type {ReactNode} from 'react';

import React from 'react';

type DynamicFormShellProps = {
    /** The current page */
    children: ReactNode;

    /** testID of the screen wrapper */
    testID: string;

    /** Title in the header */
    headerTitle: string;

    /** Called when the user presses the header's back button */
    onBackButtonPress: () => void;

    /** Unique page keys in order, for the step indicator */
    stepNames: string[];

    /** Index of the highlighted step */
    stepIndex: number;

    /** What the current page asks, read by screen readers with its step number */
    stepTitle?: string;

    /** Shows the step indicator under the header */
    shouldShowStepIndicator: boolean;
};

/** Header, and a step indicator when asked for, around one dynamic form page */
function DynamicFormShell({children, testID, headerTitle, onBackButtonPress, stepNames, stepIndex, stepTitle, shouldShowStepIndicator}: DynamicFormShellProps) {
    if (shouldShowStepIndicator) {
        return (
            <InteractiveStepWrapper
                wrapperID={testID}
                headerTitle={headerTitle}
                stepNames={stepNames}
                startStepIndex={stepIndex}
                stepAccessibilityDescription={stepTitle}
                shouldAnnounceCompletedSteps
                handleBackButtonPress={onBackButtonPress}
                shouldRemountSubHeaderOnStepChange
                shouldEnableMaxHeight
            >
                {children}
            </InteractiveStepWrapper>
        );
    }
    return (
        <ScreenWrapper
            testID={testID}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={headerTitle}
                onBackButtonPress={onBackButtonPress}
            />
            {children}
        </ScreenWrapper>
    );
}

export default DynamicFormShell;
