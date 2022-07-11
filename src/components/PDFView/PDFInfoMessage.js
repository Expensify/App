import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../Text';
import TextLink from '../TextLink';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** Callback function to indicate that PDF password form should be shown */
    onShowForm: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const PDFInfoMessage = (props) => {
    const containerStyles = props.isSmallScreenWidth
        ? [styles.p5, styles.w100, styles.h100]
        : [styles.pdfPasswordForm.wideScreen, styles.alignItemsCenter];

    return (
        <>
            {props.isSmallScreenWidth ? (
                <View style={containerStyles}>
                    <Text>
                        <Text style={styles.textLarge}>
                            {`${props.translate('attachmentView.pdfPasswordForm.infoText')} `}
                        </Text>
                        <Text style={styles.textLarge}>
                            {`${props.translate('attachmentView.pdfPasswordForm.beforeLinkText')} `}
                        </Text>
                        <TextLink onPress={props.onShowForm} style={styles.textLarge}>
                            {`${props.translate('attachmentView.pdfPasswordForm.linkText')} `}
                        </TextLink>
                        <Text style={styles.textLarge}>
                            {props.translate('attachmentView.pdfPasswordForm.afterLinkText')}
                        </Text>
                    </Text>
                </View>
            ) : (
                <View style={containerStyles}>
                    <Icon
                        src={Expensicons.EyeDisabled}
                        width={variables.iconSizeSuperLarge}
                        height={variables.iconSizeSuperLarge}
                    />
                    <Text style={[styles.h1, styles.mb3, styles.mt3]}>
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
            )}
        </>
    );
};

PDFInfoMessage.propTypes = propTypes;
PDFInfoMessage.displayName = 'PDFInfoMessage';

export default compose(
    withWindowDimensions,
    withLocalize,
)(PDFInfoMessage);
