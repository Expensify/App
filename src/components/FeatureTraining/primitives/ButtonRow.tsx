import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type ButtonRowProps = {
    /** Buttons sharing the horizontal row, e.g. BackButton and ConfirmButton */
    children?: ReactNode;
};

function ButtonRow({children}: ButtonRowProps) {
    const styles = useThemeStyles();
    return <View style={styles.featureTrainingModalNavButtons}>{children}</View>;
}

ButtonRow.displayName = 'FeatureTraining.ButtonRow';

export default ButtonRow;
