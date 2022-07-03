import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import * as BankAccounts from '../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import AddPlaidBankAccount from '../components/AddPlaidBankAccount';
import getPlaidOAuthReceivedRedirectURI from '../libs/getPlaidOAuthReceivedRedirectURI';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import Text from '../components/Text';
import styles from '../styles/styles';
import Button from '../components/Button';
import FormScrollView from '../components/FormScrollView';
import FormAlertWithSubmitButton from '../components/FormAlertWithSubmitButton';
import FormHelper from '../libs/FormHelper';
import * as ReimbursementAccount from '../libs/actions/ReimbursementAccount';
import TextInput from '../components/TextInput';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus/index.native';
import ROUTES from '../ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
    personalBankAccount: PropTypes.shape({
        error: PropTypes.string,
        success: PropTypes.string,
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    personalBankAccount: {
        error: '',
        success: '',
        loading: false,
    },
};

class AddPersonalBankAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.getErrorText = this.getErrorText.bind(this);
        this.clearError = this.clearError.bind(this);
        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            selectedPlaidBankAccount: undefined,
            plaidAccessToken: '',
            password: '',
        };

        this.formHelper = new FormHelper({
            errorPath: 'personalBankAccount.errorFields',
            setErrors: errorFields => ReimbursementAccount.setFormValidationErrorFields(ONYXKEYS.PERSONAL_BANK_ACCOUNT, errorFields),
        });
    }

    componentDidMount() {
        BankAccounts.clearOnyxObject(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    }

    /**
     * @returns {Object}
     */
    getErrors() {
        return this.formHelper.getErrors(this.props);
    }

    /**
     * @param {String} fieldName
     * @returns {String}
     */
    getErrorText(fieldName) {
        const errors = this.getErrors();
        if (!errors[fieldName]) {
            return '';
        }

        return this.props.translate(this.errorTranslationKeys[fieldName]);
    }

    /**
     * @param {String} path
     */
    clearError(path) {
        this.formHelper.clearError(this.props, path);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (_.isUndefined(this.state.selectedPlaidBankAccount)) {
            errors.selectedBank = true;
        }

        if (this.props.isPasswordRequired && _.isEmpty(this.state.password)) {
            errors.password = true;
        }

        ReimbursementAccount.setFormValidationErrorFields(ONYXKEYS.PERSONAL_BANK_ACCOUNT, errors);
        return _.size(errors) === 0;
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        BankAccounts.addPersonalBankAccount(this.state.selectedPlaidBankAccount, this.state.password, this.state.plaidAccessToken);
    }

    render() {
        const success = lodashGet(this.props, 'personalBankAccount.success', '');
        const error = lodashGet(this.props, 'personalBankAccount.error', '');
        const loading = lodashGet(this.props, 'personalBankAccount.loading', false);

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('bankAccount.addBankAccount')}
                        onCloseButtonPress={Navigation.goBack}
                        shouldShowBackButton
                        onBackButtonPress={Navigation.goBack}
                    />
                    {success ? (
                        <>
                            <Text style={[styles.formSuccess, styles.mh5]}>
                                {success}
                            </Text>
                            <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd]}>
                                <Button
                                    success
                                    text={this.props.translate('common.continue')}
                                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS)}
                                />
                            </View>
                        </>
                    ) : (
                        <FormScrollView>
                            <View style={[styles.mh5, styles.mb5]}>
                                <AddPlaidBankAccount
                                    onSelect={(params) => {
                                        this.setState({
                                            selectedPlaidBankAccount: params.selectedPlaidBankAccount,
                                            plaidAccessToken: params.plaidAccessToken,
                                        });
                                    }}
                                    onExitPlaid={Navigation.goBack}
                                    receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                                />
                                {!_.isUndefined(this.state.selectedPlaidBankAccount) && (
                                    <View style={[styles.mb5]}>
                                        <TextInput
                                            label={this.props.translate('addPersonalBankAccountPage.enterPassword')}
                                            secureTextEntry
                                            value={this.state.password}
                                            autoCompleteType="password"
                                            textContentType="password"
                                            autoCapitalize="none"
                                            autoFocus={canFocusInputOnScreenFocus()}
                                            onChangeText={text => this.setState({password: text})}
                                            errorText={this.getErrorText('password')}
                                            hasError={this.getErrors().password}
                                        />
                                    </View>
                                )}
                            </View>
                            {!_.isUndefined(this.state.selectedPlaidBankAccount) && (
                                <FormAlertWithSubmitButton
                                    isAlertVisible={Boolean(error)}
                                    buttonText={this.props.translate('common.saveAndContinue')}
                                    onSubmit={this.submit}
                                    message={error}
                                    isLoading={loading}
                                />
                            )}
                        </FormScrollView>
                    )}
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

AddPersonalBankAccountPage.propTypes = propTypes;
AddPersonalBankAccountPage.defaultProps = defaultProps;
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default compose(
    withLocalize,
    withOnyx({
        personalBankAccount: {
            key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
        },
    }),
)(AddPersonalBankAccountPage);
