import variables from '@styles/variables';

import React, {useCallback, useMemo, useState} from 'react';

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

    const toggleWillShowAgain = useCallback(() => {
        onWillShowAgainChange?.(!willShowAgain);
        setWillShowAgain((prev) => !prev);
    }, [onWillShowAgainChange, willShowAgain]);

    // Closing after confirm is the consumer's responsibility — call it inside onConfirm when desired.
    const handleConfirm = useCallback(() => {
        onConfirm?.(willShowAgain);
    }, [onConfirm, willShowAgain]);

    const handleClose = useCallback(() => onClose?.(), [onClose]);

    const stateValue = useMemo<FeatureTrainingStateValue>(
        () => ({
            willShowAgain,
            shouldShowLoadingImmediatelyOnPress: undefined,
            isCarousel: false,
            confirmSentryLabel,
            currentPage: undefined,
            pageCount: undefined,
            isLastPage: undefined,
            contentMinHeight: undefined,
        }),
        [willShowAgain, confirmSentryLabel],
    );

    const actionsValue = useMemo<FeatureTrainingActionsValue>(
        () => ({
            toggleWillShowAgain,
            handleConfirm,
            handleClose,
            advance: undefined,
            goBack: undefined,
        }),
        [toggleWillShowAgain, handleConfirm, handleClose],
    );

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
