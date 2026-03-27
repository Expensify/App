import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

type InteractiveStepSubPageHeaderProps = {
    /** List of step names to display */
    stepNames: readonly string[];

    /** Current step index (0-based) */
    currentStepIndex: number;

    /** Function to call when a step is selected */
    onStepSelected?: (stepIndex: number) => void;
};

const MIN_AMOUNT_FOR_EXPANDING = 3;
const MIN_AMOUNT_OF_STEPS = 2;

function InteractiveStepSubPageHeader({stepNames, currentStepIndex, onStepSelected}: InteractiveStepSubPageHeaderProps) {
    const styles = useThemeStyles();
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

                return (
                    <View
                        style={[styles.interactiveStepHeaderStepContainer, hasConnectingLine && styles.flex1]}
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
                            onPress={() => handleStepPress(isLockedStep, index)}
                            accessible
                            accessibilityLabel={stepName}
                            role={CONST.ROLE.BUTTON}
                        >
                            {isCompletedStep ? (
                                <Icon
                                    src={icons.Checkmark}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                    fill={colors.white}
                                />
                            ) : (
                                <Text style={[styles.interactiveStepHeaderStepText, isLockedStep && styles.textSupporting]}>{index + 1}</Text>
                            )}
                        </PressableWithFeedback>
                        {hasConnectingLine ? <View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]} /> : null}
                    </View>
                );
            })}
        </View>
    );
}

export default InteractiveStepSubPageHeader;
