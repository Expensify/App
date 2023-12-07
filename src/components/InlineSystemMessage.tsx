import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useTheme from '@styles/theme/useTheme';
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
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon
                src={Expensicons.Exclamation}
                fill={theme.danger}
            />
            <Text style={styles.inlineSystemMessage}>{message}</Text>
        </View>
    );
}

InlineSystemMessage.displayName = 'InlineSystemMessage';

export default InlineSystemMessage;
