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
import Form from '../components/Form';
import TextInput from '../components/TextInput';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus/index.native';
import ROUTES from '../ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
    personalBankAccount: PropTypes.shape({
        error: PropTypes.string,
        shouldShowSuccess: PropTypes.bool,
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    personalBankAccount: {
        error: '',
        shouldShowSuccess: false,
        isLoading: false,
    },
};

class AddPersonalBankAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            selectedPlaidBankAccount: undefined,
        };
    }

    componentDidMount() {
        BankAccounts.clearPersonalBankAccount();
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Ojbect}
     */
    validate(values) {
        const errors = {};
        if (_.isUndefined(this.state.selectedPlaidBankAccount)) {
            errors.selectedBank = true;
        }

        if (this.props.isPasswordRequired && _.isEmpty(values.password)) {
            errors.password = true;
        }

        return errors;
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    submit(values) {
        BankAccounts.addPersonalBankAccount(this.state.selectedPlaidBankAccount, values.password);
    }

    render() {
        const shouldShowSuccess = lodashGet(this.props, 'personalBankAccount.shouldShowSuccess', false);

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
                    <Form
                        formID={ONYXKEYS.PERSONAL_BANK_ACCOUNT}
                        isSubmitButtonVisible={!_.isUndefined(this.state.selectedPlaidBankAccount)}
                        submitButtonText={this.props.translate('common.saveAndContinue')}
                        onSubmit={this.submit}
                        validate={this.validate}
                        style={[styles.mh5, styles.mb5, styles.flex1]}
                    >
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
                                        inputID="password"
                                        label={this.props.translate('addPersonalBankAccountPage.enterPassword')}
                                        secureTextEntry
                                        autoCompleteType="password"
                                        textContentType="password"
                                        autoCapitalize="none"
                                        autoFocus={canFocusInputOnScreenFocus()}
                                    />
                                </View>
                            )}
                        </View>
                    </Form>
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
