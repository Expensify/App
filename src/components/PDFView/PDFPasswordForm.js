import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import styles from '../../styles/styles';
import PDFInfoMessage from './PDFInfoMessage';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import shouldDelayFocus from '../../libs/shouldDelayFocus';

const propTypes = {
    /** If the submitted password is invalid (show an error message) */
    isPasswordInvalid: PropTypes.bool,

    /** If loading indicator should be shown */
    shouldShowLoadingIndicator: PropTypes.bool,

    /** Notify parent that the password form has been submitted */
    onSubmit: PropTypes.func,

    /** Notify parent that the password has been updated/edited */
    onPasswordUpdated: PropTypes.func,

    /** Notify parent that a text field has been focused or blurred */
    onPasswordFieldFocused: PropTypes.func,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
    shouldShowLoadingIndicator: false,
    onSubmit: () => {},
    onPasswordUpdated: () => {},
    onPasswordFieldFocused: () => {},
};

class PDFPasswordForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            validationErrorText: '',
            shouldShowForm: false,
        };
        this.submitPassword = this.submitPassword.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.showForm = this.showForm.bind(this);
        this.validateAndNotifyPasswordBlur = this.validateAndNotifyPasswordBlur.bind(this);
    }

    submitPassword() {
        if (!this.validate()) {
            return;
        }
        this.props.onSubmit(this.state.password);
    }

    updatePassword(password) {
        this.props.onPasswordUpdated(password);
        if (!_.isEmpty(password) && this.state.validationErrorText) {
            this.setState({validationErrorText: ''});
        }
        this.setState({password});
    }

    validate() {
        if (!_.isEmpty(this.state.password)) {
            return true;
        }
        this.setState({
            validationErrorText: this.props.translate('attachmentView.passwordRequired'),
        });
        return false;
    }

    validateAndNotifyPasswordBlur() {
        this.validate();
        this.props.onPasswordFieldFocused(false);
    }

    showForm() {
        this.setState({shouldShowForm: true});
    }

    render() {
        const containerStyle = this.props.isSmallScreenWidth
            ? [styles.flex1, styles.w100]
            : styles.pdfPasswordForm.wideScreenWidth;

        return (
            <>
                {this.state.shouldShowForm ? (
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        style={containerStyle}
                        contentContainerStyle={styles.p5}
                    >
                        <View style={styles.mb4}>
                            <Text>
                                {this.props.translate('attachmentView.pdfPasswordForm.formLabel')}
                            </Text>
                        </View>
                        <TextInput
                            label={this.props.translate('common.password')}
                            autoComplete="off"
                            autoCorrect={false}
                            textContentType="password"
                            onChangeText={this.updatePassword}
                            returnKeyType="done"
                            onSubmitEditing={this.submitPassword}
                            errorText={this.props.isPasswordInvalid ? this.props.translate('attachmentView.passwordIncorrect') : this.state.validationErrorText}
                            onFocus={() => this.props.onPasswordFieldFocused(true)}
                            onBlur={this.validateAndNotifyPasswordBlur}
                            autoFocus
                            shouldDelayFocus={shouldDelayFocus}
                            secureTextEntry
                        />
                        <Button
                            text={this.props.translate('common.confirm')}
                            onPress={this.submitPassword}
                            style={styles.mt4}
                            isLoading={this.props.shouldShowLoadingIndicator}
                            pressOnEnter
                        />
                    </ScrollView>
                ) : (
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <PDFInfoMessage onShowForm={this.showForm} />
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
)(PDFPasswordForm);
