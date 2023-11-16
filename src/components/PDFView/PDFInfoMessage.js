import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';

const propTypes = {
    /** Callback function to indicate that PDF password form should be shown */
    onShowForm: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

function PDFInfoMessage(props) {
    const styles = useThemeStyles();
    return (
        <View style={styles.alignItemsCenter}>
            <Icon
                src={Expensicons.EyeDisabled}
                width={variables.iconSizeSuperLarge}
                height={variables.iconSizeSuperLarge}
            />
            <Text style={[styles.textHeadline, styles.mb3, styles.mt3]}>{props.translate('attachmentView.pdfPasswordForm.title')}</Text>
            <Text>{props.translate('attachmentView.pdfPasswordForm.infoText')}</Text>
            <Text>
                {props.translate('attachmentView.pdfPasswordForm.beforeLinkText')}
                <TextLink onPress={props.onShowForm}>{` ${props.translate('attachmentView.pdfPasswordForm.linkText')} `}</TextLink>
                {props.translate('attachmentView.pdfPasswordForm.afterLinkText')}
            </Text>
        </View>
    );
}

PDFInfoMessage.propTypes = propTypes;
PDFInfoMessage.displayName = 'PDFInfoMessage';

export default withLocalize(PDFInfoMessage);
