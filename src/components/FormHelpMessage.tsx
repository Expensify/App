import isEmpty from 'lodash/isEmpty';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type FormHelpMessageProps = {
    /** Error or hint text. Ignored when children is not empty */
    message?: string | React.ReactNode;

    /** Children to render next to dot indicator */
    children?: React.ReactNode;

    /** Indicates whether to show error or hint */
    isError?: boolean;

    /** Container style props */
    style?: StyleProp<ViewStyle>;

    /** Whether to show dot indicator */
    shouldShowRedDotIndicator?: boolean;
};

function FormHelpMessage({message = '', children, isError = true, style, shouldShowRedDotIndicator = true}: FormHelpMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    if (isEmpty(message) && isEmpty(children)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, style]}>
            {isError && shouldShowRedDotIndicator && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={theme.danger}
                />
            )}
            <View style={[styles.flex1, isError && shouldShowRedDotIndicator ? styles.ml2 : {}]}>
                {children ?? <Text style={[isError ? styles.formError : styles.formHelp, styles.mb0]}>{message}</Text>}
            </View>
        </View>
    );
}

FormHelpMessage.displayName = 'FormHelpMessage';

export default FormHelpMessage;
