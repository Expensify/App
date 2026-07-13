import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

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
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
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
                const stepPositionLabel = translate('stepCounter', {
                    step: index + 1,
                    total: stepNames.length,
                });
                const stepAccessibilityLabel = isCurrentStep && currentStepAccessibilityDescription ? `${stepPositionLabel}, ${currentStepAccessibilityDescription}` : stepPositionLabel;

                const stepButtonStyle = [
                    styles.interactiveStepHeaderStepButton,
                    isLockedStep && styles.interactiveStepHeaderLockedStepButton,
                    isCompletedStep && styles.interactiveStepHeaderCompletedStepButton,
                    !onStepSelected && styles.cursorDefault,
                ];

                const stepAccessibilityContent = (
                    <>
                        <Text style={styles.screenReaderOnlyAnchor}>{stepAccessibilityLabel}</Text>
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
                                    {index + 1}
                                </Text>
                            )}
                        </View>
                    </>
                );

                return (
                    <View
                        style={[styles.interactiveStepHeaderStepContainer, hasConnectingLine && styles.flex1]}
                        key={stepName}
                    >
                        {onStepSelected ? (
                            <PressableWithFeedback
                                style={stepButtonStyle}
                                onPress={() => handleStepPress(isLockedStep, index)}
                                disabled={isLockedStep}
                                role={CONST.ROLE.BUTTON}
                                aria-current={isCurrentStep ? 'step' : undefined}
                                sentryLabel={CONST.SENTRY_LABEL.INTERACTIVE_STEP_SUB_HEADER.STEP_BUTTON}
                            >
                                {stepAccessibilityContent}
                            </PressableWithFeedback>
                        ) : (
                            <View
                                style={stepButtonStyle}
                                aria-current={isCurrentStep ? 'step' : undefined}
                                tabIndex={0}
                            >
                                {stepAccessibilityContent}
                            </View>
                        )}
                        {hasConnectingLine ? <View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]} /> : null}
                    </View>
                );
            })}
        </View>
    );
}

export default InteractiveStepSubPageHeader;
