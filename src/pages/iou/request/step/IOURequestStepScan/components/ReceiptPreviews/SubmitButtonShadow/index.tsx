import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SubmitButtonShadowProps} from './types';

// isInLandscapeMode is only used on native platforms.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SubmitButtonShadow({children, isInLandscapeMode}: SubmitButtonShadowProps) {
    const styles = useThemeStyles();

    return <View style={[styles.receiptsSubmitButton, styles.buttonShadowContainer, styles.webButtonShadow]}>{children}</View>;
}

export default SubmitButtonShadow;
