import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import Button from '../Button';
import Text from '../Text';
import TextLink from '../TextLink';
import TextInput from '../TextInput';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import colors from '../../styles/colors';
import variables from '../../styles/variables';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** If the submitted password is invalid (show an error message) */
    isPasswordInvalid: PropTypes.bool,

    /** If the password field should be auto-focused */
    shouldAutofocusPasswordField: PropTypes.bool,

    /** If loading indicator should be shown */
    shouldShowLoadingIndicator: PropTypes.bool,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
    shouldAutofocusPasswordField: false,
    shouldShowLoadingIndicator: false,
};

class PDFPasswordForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            validationErrorText: '',
            isEditingInProgress: true,
            shouldShowInfoMessage: true,
        };
        this.submitPassword = this.submitPassword.bind(this);
        this.validateOnBlur = this.validateOnBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.hideInfoMessage = this.hideInfoMessage.bind(this);
    }

    submitPassword() {
        this.validateOnBlur();
        if (!_.isEmpty(this.state.password)) {
            this.setState({isEditingInProgress: false});
            this.props.onSubmit(this.state.password);
        }
    }

    updatePassword(password) {
        if (!_.isEmpty(password)) {
            this.setState({validationErrorText: ''});
        }
        this.setState({password, isEditingInProgress: true});
    }

    validateOnBlur() {
        if (!_.isEmpty(this.state.password)) {
            return;
        }
        this.setState({
            validationErrorText: this.props.translate('attachmentView.passwordRequired'),
        });
    }

    hideInfoMessage() {
        this.setState({shouldShowInfoMessage: false});
    }

    render() {
        // Use container styles appropriate for screen size.
        const containerStyles = this.props.isSmallScreenWidth
            ? styles.pdfPasswordForm.narrowScreen
            : styles.pdfPasswordForm.wideScreen;

        return (
            <>
                {this.state.shouldShowInfoMessage ? (
                    <View style={[containerStyles, styles.alignItemsCenter]}>
                        <Icon
                            src={Expensicons.EyeDisabled}
                            width={variables.iconSizeSuperLarge}
                            height={variables.iconSizeSuperLarge}
                        />
                        <Text style={[styles.h1, styles.mb3, styles.mt3]}>
                            {this.props.translate('attachmentView.pdfPasswordForm.title')}
                        </Text>
                        <Text>{this.props.translate('attachmentView.pdfPasswordForm.infoText')}</Text>
                        <Text>
                            {this.props.translate('attachmentView.pdfPasswordForm.beforeLinkText')}
                            <TextLink onPress={this.hideInfoMessage} style={[styles.ml1, styles.mr1]}>
                                {this.props.translate('attachmentView.pdfPasswordForm.linkText')}
                            </TextLink>
                            {this.props.translate('attachmentView.pdfPasswordForm.afterLinkText')}
                        </Text>
                    </View>
                ) : (
                    <View style={containerStyles}>
                        <View style={this.props.isSmallScreenWidth ? styles.flexGrow1 : {}}>
                            <Text style={styles.mb4}>
                                {this.props.translate('attachmentView.pdfPasswordForm.formLabel')}
                            </Text>
                            <TextInput
                                label={this.props.translate('common.password')}
                                autoComplete="off"
                                autoCorrect={false}
                                textContentType="password"
                                onChangeText={this.updatePassword}
                                returnKeyType="done"
                                onSubmitEditing={this.submitPassword}
                                errorText={this.state.validationErrorText}
                                onBlur={this.validateOnBlur}
                                autoFocus={this.props.shouldAutofocusPasswordField}
                                secureTextEntry
                            />
                        </View>
                        <View>
                            {!this.state.isEditingInProgress && this.props.isPasswordInvalid && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.flexGrow1]}>
                                    <Icon src={Expensicons.Exclamation} fill={colors.red} />
                                    <View style={[styles.flexRow, styles.ml2, styles.flexWrap, styles.flex1]}>
                                        <Text style={styles.mutedTextLabel}>
                                            {this.props.translate('attachmentView.passwordIncorrect')}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            <Button
                                text={this.props.translate('common.confirm')}
                                onPress={this.submitPassword}
                                style={[styles.pt4, {paddingBottom: this.props.insets.bottom}]}
                                isLoading={this.props.shouldShowLoadingIndicator}
                                pressOnEnter
                            />
                        </View>
                    </View>
                )}
            </>
        );
    }
}

PDFPasswordForm.propTypes = propTypes;
PDFPasswordForm.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withSafeAreaInsets,
)(PDFPasswordForm);
