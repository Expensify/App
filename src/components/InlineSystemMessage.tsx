import React from 'react';
import {TextStyle, View, ViewStyle} from 'react-native';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type InlineSystemMessageProps = {
    /** Error to display */
    message?: string;
};

function InlineSystemMessage({message = ''}: InlineSystemMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    if (!message) {
        return null;
    }

    return (
        <View style={[styles.flexRow as ViewStyle, styles.alignItemsCenter as ViewStyle]}>
            <Icon
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                src={Expensicons.Exclamation}
                fill={theme.danger}
            />
            <Text style={styles.inlineSystemMessage as TextStyle}>{message}</Text>
        </View>
    );
}

InlineSystemMessage.displayName = 'InlineSystemMessage';

export default InlineSystemMessage;
