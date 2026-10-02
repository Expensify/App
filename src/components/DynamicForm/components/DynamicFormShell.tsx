import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScreenWrapper from '@components/ScreenWrapper';

import type {ReactNode} from 'react';

import React from 'react';

type DynamicFormShellProps = {
    children: ReactNode;
    testID: string;
    headerTitle: string;
    onBackButtonPress: () => void;

    /** Page names in order, for the step indicator */
    stepNames: string[];

    stepIndex: number;
    shouldShowStepIndicator: boolean;
};

/** Header, and a step indicator when asked for, around one dynamic form page */
function DynamicFormShell({children, testID, headerTitle, onBackButtonPress, stepNames, stepIndex, shouldShowStepIndicator}: DynamicFormShellProps) {
    if (shouldShowStepIndicator) {
        return (
            <InteractiveStepWrapper
                wrapperID={testID}
                headerTitle={headerTitle}
                stepNames={stepNames}
                startStepIndex={stepIndex}
                handleBackButtonPress={onBackButtonPress}
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
