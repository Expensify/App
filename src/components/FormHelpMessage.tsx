import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import * as Localize from '@libs/Localize';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type FormHelpMessageProps = {
    /** Error or hint text. Ignored when children is not empty */
    message?: string | Array<string | Record<string, string>>;

    /** Children to render next to dot indicator */
    children?: React.ReactNode;

    /** Indicates whether to show error or hint */
    isError?: boolean;

    /** Container style props */
    style?: Array<StyleProp<ViewStyle>>;
};

function FormHelpMessage({message = '', children, isError = true, style = []}: FormHelpMessageProps) {
    if (isEmpty(message) && isEmpty(children)) {
        return null;
    }

    const translatedMessage = Localize.translateIfPhraseKey(message);
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, ...style]}>
            {isError && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={themeColors.danger}
                />
            )}
            <View style={[styles.flex1, isError && styles.ml2]}>{children ?? <Text style={[isError ? styles.formError : styles.formHelp, styles.mb0]}>{translatedMessage}</Text>}</View>
        </View>
    );
}

FormHelpMessage.displayName = 'FormHelpMessage';

export default FormHelpMessage;
