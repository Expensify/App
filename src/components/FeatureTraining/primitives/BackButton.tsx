import Button from '@components/ButtonComposed';
import {useFeatureTrainingActions, useFeatureTrainingState} from '@components/FeatureTraining/context';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type BackButtonProps = {
    /** Style for the button, e.g. flex1 when sharing a ButtonRow */
    style?: StyleProp<ViewStyle>;
};

function BackButton({style}: BackButtonProps) {
    const {translate} = useLocalize();
    const {isCarousel, currentPage} = useFeatureTrainingState();
    const {goBack} = useFeatureTrainingActions();

    if (!isCarousel || currentPage === 0 || !goBack) {
        return null;
    }

    return (
        <Button
            size={CONST.BUTTON_SIZE.LARGE}
            onPress={goBack}
            sentryLabel={CONST.SENTRY_LABEL.FEATURE_TRAINING.BACK_BUTTON}
            style={style}
        >
            <Button.Text>{translate('common.back')}</Button.Text>
        </Button>
    );
}

BackButton.displayName = 'FeatureTraining.BackButton';

export default BackButton;
