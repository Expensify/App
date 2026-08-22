import CheckboxWithLabel from '@components/CheckboxWithLabel';
import {useFeatureTrainingActions, useFeatureTrainingState} from '@components/FeatureTraining/context';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

function DismissOption() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {willShowAgain} = useFeatureTrainingState();
    const {toggleWillShowAgain} = useFeatureTrainingActions();

    return (
        <CheckboxWithLabel
            label={translate('featureTraining.doNotShowAgain')}
            accessibilityLabel={translate('featureTraining.doNotShowAgain')}
            style={[styles.mb5]}
            isChecked={!willShowAgain}
            onInputChange={toggleWillShowAgain}
        />
    );
}

DismissOption.displayName = 'FeatureTraining.DismissOption';

export default DismissOption;
