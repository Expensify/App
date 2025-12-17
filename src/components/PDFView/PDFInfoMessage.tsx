import type {KeyboardEvent} from 'react';
import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type PDFInfoMessageProps = {
    /** Callback function to indicate that PDF password form should be shown */
    onShowForm: (event: GestureResponderEvent | KeyboardEvent) => void;
};

function PDFInfoMessage({onShowForm}: PDFInfoMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.alignItemsCenter}>
            <Icon
                fill={theme.icon}
                src={Expensicons.EyeDisabled}
                width={variables.iconSizeSuperLarge}
                height={variables.iconSizeSuperLarge}
            />
            <Text style={[styles.textHeadline, styles.mb3, styles.mt3]}>{translate('attachmentView.pdfPasswordForm.title')}</Text>
            <Text>{translate('attachmentView.pdfPasswordForm.infoText')}</Text>
            <Text>
                {translate('attachmentView.pdfPasswordForm.beforeLinkText')}
                <TextLink onPress={onShowForm}>{` ${translate('attachmentView.pdfPasswordForm.linkText')} `}</TextLink>
                {translate('attachmentView.pdfPasswordForm.afterLinkText')}
            </Text>
        </View>
    );
}

export default PDFInfoMessage;
