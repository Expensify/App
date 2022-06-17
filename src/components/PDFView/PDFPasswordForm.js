import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import colors from '../../styles/colors';
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
        };
        this.submitPassword = this.submitPassword.bind(this);
        this.validateOnBlur = this.validateOnBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
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

    render() {
        // Use container styles appropriate for screen size.
        const containerStyles = this.props.isSmallScreenWidth
            ? styles.pdfPasswordForm.narrowScreen
            : styles.pdfPasswordForm.wideScreen;

        const buttonStyles = [
            styles.pdfPasswordForm.confirmButton,
            {paddingBottom: this.props.insets.bottom},
        ];

        return (
            <View style={containerStyles}>
                <Text style={styles.mb4}>
                    {this.props.translate('attachmentView.pdfPasswordFormLabel')}
                </Text>
                <TextInput
                    label={this.props.translate('common.password')}
                    autoCompleteType="off"
                    textContentType="password"
                    onInputChange={this.updatePassword}
                    returnKeyType="done"
                    onSubmitEditing={this.submitPassword}
                    errorText={this.state.validationErrorText}
                    onBlur={this.validateOnBlur}
                    autoFocus={this.props.shouldAutofocusPasswordField}
                    secureTextEntry
                />
                {!this.state.isEditingInProgress && this.props.isPasswordInvalid && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt3]}>
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
                    style={buttonStyles}
                    isLoading={this.props.shouldShowLoadingIndicator}
                    pressOnEnter
                />
            </View>
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
