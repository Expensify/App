import {useFeatureTrainingActions, useFeatureTrainingState} from '@components/FeatureTraining/context';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ConfirmButtonProps = {
    children: string;
    sentryLabel?: string;
};

function ConfirmButton({children, sentryLabel}: ConfirmButtonProps) {
    const styles = useThemeStyles();
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
            containerStyles={styles.flex1}
        />
    );
}

ConfirmButton.displayName = 'FeatureTraining.ConfirmButton';

export default ConfirmButton;
export type {ConfirmButtonProps};
