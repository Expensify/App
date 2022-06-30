import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
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

    /** Notify parent that the UI should be updated to avoid keyboard */
    onAvoidKeyboard: PropTypes.func,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
    shouldAutofocusPasswordField: false,
    shouldShowLoadingIndicator: false,
    onAvoidKeyboard: () => {},
};

class PDFPasswordForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            validationErrorText: '',
            isEditingInProgress: true,
            shouldShowForm: false,
        };
        this.submitPassword = this.submitPassword.bind(this);
        this.validateOnBlur = this.validateOnBlur.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.showForm = this.showForm.bind(this);
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
        // Notify parent that keyboard is no longer visible (on mobile devices).
        this.props.onAvoidKeyboard(false);

        if (!_.isEmpty(this.state.password)) {
            return;
        }
        this.setState({
            validationErrorText: this.props.translate('attachmentView.passwordRequired'),
        });
    }

    showForm() {
        this.setState({shouldShowForm: true});
    }

    render() {
        // Use container styles appropriate for screen size.
        const containerStyles = this.props.isSmallScreenWidth
            ? styles.pdfPasswordForm.narrowScreen
            : styles.pdfPasswordForm.wideScreen;

        return (
            <>
                {this.state.shouldShowForm ? (
                    <View style={containerStyles}>
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
                            onFocus={() => this.props.onAvoidKeyboard(true)}
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
                            style={styles.pt4}
                            isLoading={this.props.shouldShowLoadingIndicator}
                            pressOnEnter
                        />
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
