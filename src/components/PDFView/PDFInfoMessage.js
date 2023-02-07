import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../Text';
import TextLink from '../TextLink';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** Callback function to indicate that PDF password form should be shown */
    onShowForm: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const PDFInfoMessage = props => (
    <View style={styles.alignItemsCenter}>
        <Icon
            src={Expensicons.EyeDisabled}
            width={variables.iconSizeSuperLarge}
            height={variables.iconSizeSuperLarge}
        />
        <Text style={[styles.textHeadline, styles.mb3, styles.mt3]}>
            {props.translate('attachmentView.pdfPasswordForm.title')}
        </Text>
        <Text>{props.translate('attachmentView.pdfPasswordForm.infoText')}</Text>
        <Text>
            {props.translate('attachmentView.pdfPasswordForm.beforeLinkText')}
            <TextLink onPress={props.onShowForm}>
                {` ${props.translate('attachmentView.pdfPasswordForm.linkText')} `}
            </TextLink>
            {props.translate('attachmentView.pdfPasswordForm.afterLinkText')}
        </Text>
    </View>
);

PDFInfoMessage.propTypes = propTypes;
PDFInfoMessage.displayName = 'PDFInfoMessage';

export default withLocalize(PDFInfoMessage);
