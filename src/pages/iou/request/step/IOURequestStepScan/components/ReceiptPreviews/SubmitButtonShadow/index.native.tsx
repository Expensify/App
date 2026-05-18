import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SubmitButtonShadowProps} from './types';

function SubmitButtonShadow({children, isInLandscapeMode = false}: SubmitButtonShadowProps) {
    const styles = useThemeStyles();

    return <View style={[isInLandscapeMode ? styles.receiptsSubmitButtonLandscape : styles.receiptsSubmitButton, styles.buttonShadowContainer, styles.buttonShadow]}>{children}</View>;
}

export default SubmitButtonShadow;
