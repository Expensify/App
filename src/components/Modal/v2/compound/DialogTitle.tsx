import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {Title as ModalTitle} from './Heading';

type DialogTitleVariant = 'confirm' | 'decision';

type DialogTitleProps = {
    variant: DialogTitleVariant;
    children: ReactNode;
};

function DialogTitle({variant, children}: DialogTitleProps) {
    const styles = useThemeStyles();
    const containerStyle = variant === 'decision' ? [styles.flexRow, styles.mb5, styles.alignItemsCenter] : [styles.flexRow, styles.mb4];
    return (
        <View style={containerStyle}>
            <ModalTitle style={[styles.headerText, styles.textLarge, styles.lineHeightXLarge]}>{children}</ModalTitle>
        </View>
    );
}

export default DialogTitle;
export type {DialogTitleProps, DialogTitleVariant};
