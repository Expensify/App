import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import InteractiveStepButton from './InteractiveStepButton';

type InteractiveStepSubPageHeaderProps = {
    /** List of step names to display */
    stepNames: readonly string[];

    /** Current step index (0-based) */
    currentStepIndex: number;

    /** Description of the current step, appended to its accessibility label */
    currentStepAccessibilityDescription: string;

    /** Function to call when a step is selected */
    onStepSelected?: (stepIndex: number) => void;
};

const MIN_AMOUNT_FOR_EXPANDING = 3;
const MIN_AMOUNT_OF_STEPS = 2;

function InteractiveStepSubPageHeader({stepNames, currentStepIndex, currentStepAccessibilityDescription, onStepSelected}: InteractiveStepSubPageHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const containerWidthStyle: ViewStyle = stepNames.length < MIN_AMOUNT_FOR_EXPANDING ? styles.mnw60 : styles.mnw100;

    if (stepNames.length < MIN_AMOUNT_OF_STEPS) {
        throw new Error(`stepNames list must have at least ${MIN_AMOUNT_OF_STEPS} elements.`);
    }

    const lastStepIndex = stepNames.length - 1;

    const handleStepPress = (isLockedStep: boolean, index: number) => {
        if (isLockedStep || !onStepSelected) {
            return;
        }
        onStepSelected(index);
    };

    return (
        <View style={[styles.interactiveStepHeaderContainer, containerWidthStyle]}>
            {stepNames.map((stepName, index) => {
                const isCompletedStep = currentStepIndex > index;
                const isLockedStep = currentStepIndex < index;
                const isLockedLine = currentStepIndex < index + 1;
                const hasConnectingLine = index < lastStepIndex;
                const isCurrentStep = currentStepIndex === index;

                return (
                    <View
                        style={[styles.interactiveStepHeaderStepContainer, hasConnectingLine && styles.flex1]}
                        key={stepName}
                    >
                        <InteractiveStepButton
                            stepNumber={index + 1}
                            stepLabel={translate('stepCounter', {
                                step: index + 1,
                                total: stepNames.length,
                            })}
                            currentStepDescription={isCurrentStep ? currentStepAccessibilityDescription : undefined}
                            isCurrentStep={isCurrentStep}
                            isLockedStep={isLockedStep}
                            isCompletedStep={isCompletedStep}
                            onPress={onStepSelected ? () => handleStepPress(isLockedStep, index) : undefined}
                        />
                        {hasConnectingLine ? <View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]} /> : null}
                    </View>
                );
            })}
        </View>
    );
}

export default InteractiveStepSubPageHeader;
