import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type SubmitButtonProps from './types';

function SubmitButton({isDisabled, submit}: SubmitButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.receiptsSubmitButton, styles.webButtonShadow]}>
            <Button
                large
                isDisabled={isDisabled}
                innerStyles={[styles.singleAvatarMedium, styles.bgGreenSuccess]}
                icon={Expensicons.ArrowRight}
                iconFill={theme.white}
                onPress={submit}
            />
        </View>
    );
}

export default SubmitButton;
