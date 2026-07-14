/**
 * Shared step circle for InteractiveStepSubHeader and InteractiveStepSubPageHeader.
 * Handles pressable vs display-only rendering and screen-reader labeling in one place.
 */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

type InteractiveStepButtonProps = {
    /** 1-based step number shown in the circle */
    stepNumber: number;

    /** Position label, e.g. "Step 1 of 6" */
    stepLabel: string;

    /** Description appended to the accessibility label for the current step */
    currentStepDescription?: string;

    /** Whether this is the active step */
    isCurrentStep: boolean;

    /** Whether this step is locked (future step) */
    isLockedStep: boolean;

    /** Whether this step is completed */
    isCompletedStep: boolean;

    /**
     * Press handler when steps are interactive.
     * Omit when the stepper is display-only.
     */
    onPress?: () => void;
};

function InteractiveStepButton({stepNumber, stepLabel, currentStepDescription, isCurrentStep, isLockedStep, isCompletedStep, onPress}: InteractiveStepButtonProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const accessibilityLabel = isCurrentStep && currentStepDescription ? `${stepLabel}, ${currentStepDescription}` : stepLabel;
    const accessibilityState = {selected: isCurrentStep};
    const stepButtonStyle = [
        styles.interactiveStepHeaderStepButton,
        isLockedStep && styles.interactiveStepHeaderLockedStepButton,
        isCompletedStep && styles.interactiveStepHeaderCompletedStepButton,
        !onPress && styles.cursorDefault,
    ];

    const stepAccessibilityContent = (
        <>
            <Text style={styles.screenReaderOnlyAnchor}>{accessibilityLabel}</Text>
            <View
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                {isCompletedStep ? (
                    <Icon
                        src={icons.Checkmark}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={colors.white}
                    />
                ) : (
                    <Text
                        accessible={false}
                        aria-hidden
                        style={[styles.interactiveStepHeaderStepText, isLockedStep && styles.textSupporting]}
                    >
                        {stepNumber}
                    </Text>
                )}
            </View>
        </>
    );

    if (onPress) {
        return (
            <PressableWithFeedback
                style={stepButtonStyle}
                onPress={onPress}
                disabled={isLockedStep}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={accessibilityLabel}
                aria-current={isCurrentStep ? 'step' : undefined}
                accessibilityState={accessibilityState}
                sentryLabel={CONST.SENTRY_LABEL.INTERACTIVE_STEP_SUB_HEADER.STEP_BUTTON}
            >
                {stepAccessibilityContent}
            </PressableWithFeedback>
        );
    }

    return (
        <View
            style={stepButtonStyle}
            accessible
            accessibilityLabel={accessibilityLabel}
            accessibilityState={accessibilityState}
            aria-current={isCurrentStep ? 'step' : undefined}
            tabIndex={0}
        >
            {stepAccessibilityContent}
        </View>
    );
}

export default InteractiveStepButton;
