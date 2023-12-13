import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import * as Localize from '@libs/Localize';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type FormHelpMessageProps = {
    /** Error or hint text. Ignored when children is not empty */
    message?: Localize.MaybePhraseKey;

    /** Children to render next to dot indicator */
    children?: React.ReactNode;

    /** Indicates whether to show error or hint */
    isError?: boolean;

    /** Container style props */
    style?: StyleProp<ViewStyle>;
};

function FormHelpMessage({message = '', children, isError = true, style}: FormHelpMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    if (isEmpty(message) && isEmpty(children)) {
        return null;
    }

    const translatedMessage = Localize.translateIfPhraseKey(message);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, style]}>
            {isError && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={theme.danger}
                />
            )}
            <View style={[styles.flex1, isError && styles.ml2]}>{children ?? <Text style={[isError ? styles.formError : styles.formHelp, styles.mb0]}>{translatedMessage}</Text>}</View>
        </View>
    );
}

FormHelpMessage.displayName = 'FormHelpMessage';

export default FormHelpMessage;
