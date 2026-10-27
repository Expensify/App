import variables from '@styles/variables';

import React, {useState} from 'react';

import type {FeatureTrainingActionsValue, FeatureTrainingStateValue} from './context';
import type {FeatureTrainingProps} from './types';

import {FeatureTrainingActionsContext, FeatureTrainingStateContext} from './context';
import useScrollableWrapper from './hooks/useScrollableWrapper';

function FeatureTraining({
    onConfirm,
    onClose,
    onWillShowAgainChange,
    shouldUseScrollView = false,
    width = variables.featureTrainingModalWidth,
    confirmSentryLabel,
    children,
}: FeatureTrainingProps) {
    const [willShowAgain, setWillShowAgain] = useState(true);
    const {Wrapper, wrapperProps} = useScrollableWrapper({shouldUseScrollView, width});

    const toggleWillShowAgain = () => {
        onWillShowAgainChange?.(!willShowAgain);
        setWillShowAgain((prev) => !prev);
    };

    // Closing after confirm is the consumer's responsibility — call it inside onConfirm when desired.
    const handleConfirm = () => {
        onConfirm?.(willShowAgain);
    };

    const handleClose = () => onClose?.();

    const stateValue: FeatureTrainingStateValue = {
        willShowAgain,
        shouldShowLoadingImmediatelyOnPress: undefined,
        isCarousel: false,
        confirmSentryLabel,
        currentPage: undefined,
        pageCount: undefined,
        isLastPage: undefined,
        contentMinHeight: undefined,
    };

    const actionsValue: FeatureTrainingActionsValue = {
        toggleWillShowAgain,
        handleConfirm,
        handleClose,
        advance: undefined,
        goBack: undefined,
    };

    return (
        <FeatureTrainingStateContext.Provider value={stateValue}>
            <FeatureTrainingActionsContext.Provider value={actionsValue}>
                <Wrapper {...wrapperProps}>{children}</Wrapper>
            </FeatureTrainingActionsContext.Provider>
        </FeatureTrainingStateContext.Provider>
    );
}

FeatureTraining.displayName = 'FeatureTraining';

export default FeatureTraining;
