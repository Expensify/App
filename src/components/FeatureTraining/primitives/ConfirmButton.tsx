import {useFeatureTrainingActions, useFeatureTrainingState} from '@components/FeatureTraining/context';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type ConfirmButtonProps = {
    /** Text label shown on the confirm button */
    children: string;

    /** Sentry label for the confirm button; falls back to the root confirmSentryLabel */
    sentryLabel?: string;

    /** Style for the button container, e.g. flex1 when sharing a ButtonRow */
    style?: StyleProp<ViewStyle>;
};

function ConfirmButton({children, sentryLabel, style}: ConfirmButtonProps) {
    const {confirmSentryLabel, shouldShowLoadingImmediatelyOnPress, isCarousel, isLastPage} = useFeatureTrainingState();
    const {handleConfirm, advance} = useFeatureTrainingActions();

    const isNextPageAction = isCarousel && !isLastPage;

    const onSubmit = () => {
        if (isNextPageAction && advance) {
            advance();
            return;
        }
        handleConfirm();
    };

    const loading = isNextPageAction ? false : shouldShowLoadingImmediatelyOnPress;

    return (
        <FormAlertWithSubmitButton
            onSubmit={onSubmit}
            buttonText={children}
            enabledWhenOffline
            shouldShowLoadingImmediatelyOnPress={loading}
            sentryLabel={sentryLabel ?? confirmSentryLabel}
            containerStyles={style}
        />
    );
}

ConfirmButton.displayName = 'FeatureTraining.ConfirmButton';

export default ConfirmButton;
