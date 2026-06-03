import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Icon from './Icon';
import Text from './Text';

type InlineSystemMessageProps = {
    /** Error to display */
    message?: string;
};

function InlineSystemMessage({message = ''}: InlineSystemMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Exclamation']);
    const selectableStyle = !canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone;
    if (!message) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon
                src={icons.Exclamation}
                fill={theme.danger}
            />
            <Text style={[styles.inlineSystemMessage, selectableStyle]}>{message}</Text>
        </View>
    );
}

export default InlineSystemMessage;

export type {InlineSystemMessageProps};
