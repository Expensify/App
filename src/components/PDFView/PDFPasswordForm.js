import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import colors from '../../styles/colors';
import PDFInfoMessage from './PDFInfoMessage';
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

    /** Notify parent that the password form has been submitted */
    onSubmit: PropTypes.func,

    /** Notify parent that the password has been updated/edited */
    onPasswordUpdated: PropTypes.func,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
    shouldAutofocusPasswordField: false,
    shouldShowLoadingIndicator: false,
    onSubmit: () => {},
    onPasswordUpdated: () => {},
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
        this.validate = this.validate.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.showForm = this.showForm.bind(this);
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

    showForm() {
        this.setState({shouldShowForm: true});
    }

    render() {
        const containerStyle = this.props.isSmallScreenWidth
            ? [styles.p5, styles.w100]
            : styles.pdfPasswordForm.wideScreenWidth;

        return (
            <>
                {this.state.shouldShowForm ? (
                    <View style={containerStyle}>
                        <ScrollView keyboardShouldPersistTaps="handled">
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
                                onBlur={this.validate}
                                autoFocus={this.props.shouldAutofocusPasswordField}
                                secureTextEntry
                            />
                            {this.props.isPasswordInvalid && (
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
                                style={styles.pt4}
                                isLoading={this.props.shouldShowLoadingIndicator}
                                pressOnEnter
                            />
                        </ScrollView>
                    </View>
                ) : (
                    <PDFInfoMessage onShowForm={this.showForm} />
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
