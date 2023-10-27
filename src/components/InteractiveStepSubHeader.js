import React, {forwardRef, useState, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import {View} from 'react-native';

import CONST from '../CONST';
import variables from '../styles/variables';
import styles from '../styles/styles';
import colors from '../styles/colors';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';
import Icon from './Icon';

const propTypes = {
    /** List of the Route Name to navigate when the step is selected */
    stepNames: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Function to call when a step is selected */
    onStepSelected: PropTypes.func.isRequired,

    /** The index of the step to start with */
    startStep: PropTypes.number,
};

const defaultProps = {
    startStep: 0,
};

const MIN_AMOUNT_FOR_EXPANDING = 3;
const MIN_AMOUNT_OF_STEPS = 2;

const InteractiveStepSubHeader = forwardRef(({stepNames, startStep, onStepSelected}, ref) => {
    if (stepNames.length < MIN_AMOUNT_OF_STEPS) {
        throw new Error(`stepNames list must have at least ${MIN_AMOUNT_OF_STEPS} elements.`);
    }

    const [currentStep, setCurrentStep] = useState(startStep);
    useImperativeHandle(
        ref,
        () => ({
            moveNext: () => {
                setCurrentStep((actualStep) => actualStep + 1);
            },
        }),
        [],
    );

    const amountOfUnions = stepNames.length - 1;

    return (
        <View style={[styles.interactiveStepHeaderContainer, {minWidth: stepNames.length < MIN_AMOUNT_FOR_EXPANDING ? '60%' : '100%'}]}>
            {map(stepNames, (stepName, index) => {
                const isCompletedStep = currentStep > index;
                const isLockedStep = currentStep < index;
                const isLockedLine = currentStep < index + 1;
                const hasUnion = index < amountOfUnions;

                const moveToStep = () => {
                    if (isLockedStep) {
                        return;
                    }
                    setCurrentStep(index);
                    onStepSelected(stepNames[index]);
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
                            ]}
                            disabled={isLockedStep}
                            onPress={moveToStep}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            {isCompletedStep ? (
                                <Icon
                                    src={Expensicons.Checkmark}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                    fill={colors.white}
                                />
                            ) : (
                                <Text style={styles.interactiveStepHeaderStepText}>{index + 1}</Text>
                            )}
                        </PressableWithFeedback>
                        {hasUnion ? <View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]} /> : null}
                    </View>
                );
            })}
        </View>
    );
});

InteractiveStepSubHeader.propTypes = propTypes;
InteractiveStepSubHeader.defaultProps = defaultProps;
InteractiveStepSubHeader.displayName = 'InteractiveStepSubHeader';

export default InteractiveStepSubHeader;
