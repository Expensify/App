import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {ViewStyle} from 'react-native';

import React, {useImperativeHandle, useState} from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

type InteractiveStepSubHeaderProps = {
    /** List of the Route Name to navigate when the step is selected */
    stepNames: readonly string[];

    /** Function to call when a step is selected */
    onStepSelected?: (stepName: string) => void;

    /** The index of the step to start with */
    startStepIndex?: number;

    /** Description of the current step, appended to its accessibility label */
    currentStepAccessibilityDescription: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<InteractiveStepSubHeaderHandle>;
};

type InteractiveStepSubHeaderHandle = {
    /** Move to the next step */
    moveNext: () => void;

    /** Move to the previous step */
    movePrevious: () => void;

    /** Move to a specific step */
    moveTo: (step: number) => void;
};

const MIN_AMOUNT_FOR_EXPANDING = 3;
const MIN_AMOUNT_OF_STEPS = 2;

function InteractiveStepSubHeader({stepNames, startStepIndex = 0, currentStepAccessibilityDescription, onStepSelected, ref}: InteractiveStepSubHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const containerWidthStyle: ViewStyle = stepNames.length < MIN_AMOUNT_FOR_EXPANDING ? styles.mnw60 : styles.mnw100;

    if (stepNames.length < MIN_AMOUNT_OF_STEPS) {
        throw new Error(`stepNames list must have at least ${MIN_AMOUNT_OF_STEPS} elements.`);
    }

    const [currentStep, setCurrentStep] = useState(startStepIndex);
    useImperativeHandle(
        ref,
        () => ({
            moveNext: () => {
                setCurrentStep((actualStep) => actualStep + 1);
            },
            movePrevious: () => {
                setCurrentStep((actualStep) => actualStep - 1);
            },
            moveTo: (step: number) => {
                setCurrentStep(step);
            },
        }),
        [],
    );
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    const amountOfUnions = stepNames.length - 1;

    return (
        <View style={[styles.interactiveStepHeaderContainer, containerWidthStyle]}>
            {stepNames.map((stepName, index) => {
                const isCompletedStep = currentStep > index;
                const isLockedStep = currentStep < index;
                const isLockedLine = currentStep < index + 1;
                const hasUnion = index < amountOfUnions;
                const isCurrentStep = currentStep === index;
                const stepPositionLabel = translate('stepCounter', {
                    step: index + 1,
                    total: stepNames.length,
                });
                const stepAccessibilityLabel = isCurrentStep && currentStepAccessibilityDescription ? `${stepPositionLabel}, ${currentStepAccessibilityDescription}` : stepPositionLabel;
                const stepAccessibilityState = {selected: isCurrentStep};

                const moveToStep = () => {
                    if (isLockedStep || !onStepSelected) {
                        return;
                    }
                    setCurrentStep(index);
                    const step = stepNames.at(index);
                    if (step) {
                        onStepSelected(step);
                    }
                };

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
                        style={[styles.interactiveStepHeaderStepContainer, hasUnion && styles.flex1]}
                        key={stepName}
                    >
                        {onStepSelected ? (
                            <PressableWithFeedback
                                style={stepButtonStyle}
                                onPress={moveToStep}
                                disabled={isLockedStep}
                                role={CONST.ROLE.BUTTON}
                                aria-current={isCurrentStep ? 'step' : undefined}
                                accessibilityState={stepAccessibilityState}
                                sentryLabel={CONST.SENTRY_LABEL.INTERACTIVE_STEP_SUB_HEADER.STEP_BUTTON}
                            >
                                {stepAccessibilityContent}
                            </PressableWithFeedback>
                        ) : (
                            <View
                                style={stepButtonStyle}
                                accessible
                                accessibilityLabel={stepAccessibilityLabel}
                                accessibilityState={stepAccessibilityState}
                                aria-current={isCurrentStep ? 'step' : undefined}
                                tabIndex={0}
                            >
                                {stepAccessibilityContent}
                            </View>
                        )}
                        {hasUnion ? <View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]} /> : null}
                    </View>
                );
            })}
        </View>
    );
}

export type {InteractiveStepSubHeaderProps, InteractiveStepSubHeaderHandle};

export default InteractiveStepSubHeader;
