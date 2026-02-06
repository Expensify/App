import type {ForwardedRef} from 'react';
import React, {useImperativeHandle, useState} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

type InteractiveStepSubHeaderProps = {
    /** List of the Route Name to navigate when the step is selected */
    stepNames: readonly string[];

    /** Function to call when a step is selected */
    onStepSelected?: (stepName: string) => void;

    /** The index of the step to start with */
    startStepIndex?: number;

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

function InteractiveStepSubHeader({stepNames, startStepIndex = 0, onStepSelected, ref}: InteractiveStepSubHeaderProps) {
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

    const amountOfUnions = stepNames.length - 1;

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    return (
        <View
            style={[styles.interactiveStepHeaderContainer, containerWidthStyle]}
            focusable
            accessibilityLabel={translate('stepCounter', {step: currentStep + 1, total: stepNames.length})}
        >
            {stepNames.map((stepName, index) => {
                const isCompletedStep = currentStep > index;
                const isLockedStep = currentStep < index;
                const isLockedLine = currentStep < index + 1;
                const hasUnion = index < amountOfUnions;

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

                return (
                    <View
                        style={[styles.interactiveStepHeaderStepContainer, hasUnion && styles.flex1]}
                        key={stepName}
                    >
                        <PressableWithFeedback
                            style={[
                                styles.interactiveStepHeaderStepButton,
                                isLockedStep && styles.interactiveStepHeaderLockedStepButton,
                                isCompletedStep && styles.interactiveStepHeaderCompletedStepButton,
                                !onStepSelected && styles.cursorDefault,
                            ]}
                            disabled={isLockedStep || !onStepSelected}
                            onPress={moveToStep}
                            accessible={false}
                            aria-hidden={!isWeb}
                            role={CONST.ROLE.BUTTON}
                        >
                            {isCompletedStep ? (
                                <Icon
                                    src={Expensicons.Checkmark}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                    fill={colors.white}
                                />
                            ) : (
                                <Text style={[styles.interactiveStepHeaderStepText, isLockedStep && styles.textSupporting]}>{index + 1}</Text>
                            )}
                        </PressableWithFeedback>
                        {hasUnion ? <View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]} /> : null}
                    </View>
                );
            })}
        </View>
    );
}

export type {InteractiveStepSubHeaderProps, InteractiveStepSubHeaderHandle};

export default InteractiveStepSubHeader;
