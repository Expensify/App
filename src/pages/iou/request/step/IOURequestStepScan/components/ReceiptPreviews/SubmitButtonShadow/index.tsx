import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SubmitButtonShadowProps} from './types';

function SubmitButtonShadow({children}: SubmitButtonShadowProps) {
    const styles = useThemeStyles();

    return <View style={[styles.receiptsSubmitButton, styles.buttonShadowContainer, styles.webButtonShadow]}>{children}</View>;
}

export default SubmitButtonShadow;
