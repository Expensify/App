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
import Text from '../components/Text';
import styles from '../styles/styles';
import * as Illustrations from '../components/Icon/Illustrations';
import Icon from '../components/Icon';
import defaultTheme from '../styles/themes/default';
import Button from '../components/Button';
import FixedFooter from '../components/FixedFooter';
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
        shouldShowSuccess: PropTypes.bool,
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    personalBankAccount: {
        error: '',
        shouldShowSuccess: false,
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
            password: '',
        };

        this.formHelper = new FormHelper({
            errorPath: 'personalBankAccount.errorFields',
            setErrors: errorFields => ReimbursementAccount.setPersonalBankAccountFormValidationErrorFields(errorFields),
        });
    }

    componentDidMount() {
        BankAccounts.clearPersonalBankAccount();
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

        ReimbursementAccount.setPersonalBankAccountFormValidationErrorFields(errors);
        return _.isEmpty(errors);
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        BankAccounts.addPersonalBankAccount(this.state.selectedPlaidBankAccount, this.state.password);
    }

    render() {
        const shouldShowSuccess = lodashGet(this.props, 'personalBankAccount.shouldShowSuccess', false);
        const error = lodashGet(this.props, 'personalBankAccount.error', '');
        const loading = lodashGet(this.props, 'personalBankAccount.loading', false);

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('bankAccount.addBankAccount')}
                    onCloseButtonPress={Navigation.goBack}
                    shouldShowBackButton
                    onBackButtonPress={Navigation.goBack}
                />
                {shouldShowSuccess ? (
                    <>
                        <View style={[styles.pageWrapper, styles.flex1, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <Icon
                                src={Illustrations.TadaBlue}
                                height={100}
                                width={100}
                                fill={defaultTheme.iconSuccessFill}
                            />
                            <View style={[styles.ph5]}>
                                <Text style={[styles.mt5, styles.h1, styles.textAlignCenter]}>
                                    {this.props.translate('addPersonalBankAccountPage.successTitle')}
                                </Text>
                                <Text style={[styles.mt3, styles.textAlignCenter]}>
                                    {this.props.translate('addPersonalBankAccountPage.successMessage')}
                                </Text>
                            </View>
                        </View>
                        <FixedFooter>
                            <Button
                                text={this.props.translate('common.continue')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS)}
                                style={[styles.mt4]}
                                iconStyles={[styles.mr5]}
                                success
                            />
                        </FixedFooter>
                    </>
                ) : (
                    <FormScrollView>
                        <View style={[styles.mh5, styles.mb5, styles.flex1]}>
                            <AddPlaidBankAccount
                                onSelect={(params) => {
                                    this.setState({
                                        selectedPlaidBankAccount: params.selectedPlaidBankAccount,
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
            </ScreenWrapper>
        );
    }
}

AddPersonalBankAccountPage.propTypes = propTypes;
AddPersonalBankAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        personalBankAccount: {
            key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
        },
    }),
)(AddPersonalBankAccountPage);
