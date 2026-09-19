import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScreenWrapper from '@components/ScreenWrapper';

import type {ReactNode} from 'react';

import React from 'react';

/** Flows shorter than this are single-screen forms and get no step indicator */
const STEP_INDICATOR_MIN_PAGES = 3;

type DynamicFormShellProps = {
    children: ReactNode;
    testID: string;
    headerTitle: string;

    /** Page names in order; the step indicator appears once there are enough of them */
    stepNames: string[];

    stepIndex: number;

    onBackButtonPress: () => void;

    /** Overrides the page-count default: true always shows the step indicator, false never does */
    shouldShowStepIndicator?: boolean;
};

/** Header, and a step indicator when the flow is long enough, around one dynamic form page */
function DynamicFormShell({children, testID, headerTitle, stepNames, stepIndex, onBackButtonPress, shouldShowStepIndicator}: DynamicFormShellProps) {
    const isIndicatorShown = shouldShowStepIndicator ?? stepNames.length >= STEP_INDICATOR_MIN_PAGES;
    if (isIndicatorShown && stepNames.length > 1) {
        return (
            <InteractiveStepWrapper
                wrapperID={testID}
                headerTitle={headerTitle}
                stepNames={stepNames}
                startStepIndex={stepIndex}
                handleBackButtonPress={onBackButtonPress}
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
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onBackButtonPress}
            />
            {children}
        </ScreenWrapper>
    );
}

export default DynamicFormShell;
