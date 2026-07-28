import Button from '@components/ButtonComposed';
import {useFeatureTrainingActions, useFeatureTrainingState} from '@components/FeatureTraining/context';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

function BackButton() {
    const styles = useThemeStyles();
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
            style={styles.flex1}
        >
            <Button.Text>{translate('common.back')}</Button.Text>
        </Button>
    );
}

BackButton.displayName = 'FeatureTraining.BackButton';

export default BackButton;
