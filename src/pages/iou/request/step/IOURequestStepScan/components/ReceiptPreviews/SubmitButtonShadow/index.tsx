import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function SubmitButtonShadow({children}: ChildrenProps) {
    const styles = useThemeStyles();

    return <View style={[styles.receiptsSubmitButton, styles.buttonShadowContainer, styles.webButtonShadow]}>{children}</View>;
}

export default SubmitButtonShadow;
