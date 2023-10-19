import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import * as BankAccounts from '../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import AddPlaidBankAccount from '../components/AddPlaidBankAccount';
import getPlaidOAuthReceivedRedirectURI from '../libs/getPlaidOAuthReceivedRedirectURI';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Form from '../components/Form';
import ROUTES from '../ROUTES';
import * as PlaidDataProps from './ReimbursementAccount/plaidDataPropTypes';
import ConfirmationPage from '../components/ConfirmationPage';
import * as PaymentMethods from '../libs/actions/PaymentMethods';

const propTypes = {
    ...withLocalizePropTypes,

    /** Contains plaid data */
    plaidData: PlaidDataProps.plaidDataPropTypes,

    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether we should show the view that the bank account was successfully added */
        shouldShowSuccess: PropTypes.bool,

        /** Any reportID we should redirect to at the end of the flow */
        exitReportID: PropTypes.string,

        /** Whether the form is loading */
        isLoading: PropTypes.bool,

        /** The account ID of the selected bank account from Plaid */
        plaidAccountID: PropTypes.string,
    }),
};

const defaultProps = {
    plaidData: PlaidDataProps.plaidDataDefaultProps,
    personalBankAccount: {
        error: '',
        shouldShowSuccess: false,
        isLoading: false,
        plaidAccountID: '',
        exitReportID: '',
    },
};

class AddPersonalBankAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
        this.exitFlow = this.exitFlow.bind(this);

        this.state = {
            selectedPlaidAccountID: '',
        };
    }

    componentWillUnmount() {
        BankAccounts.clearPersonalBankAccount();
    }

    /**
     * @returns {Object}
     */
    validate() {
        return {};
    }

    submit() {
        const selectedPlaidBankAccount = _.findWhere(lodashGet(this.props.plaidData, 'bankAccounts', []), {
            plaidAccountID: this.state.selectedPlaidAccountID,
        });

        BankAccounts.addPersonalBankAccount(selectedPlaidBankAccount);
    }

    exitFlow(shouldContinue = false) {
        const exitReportID = lodashGet(this.props, 'personalBankAccount.exitReportID');
        const onSuccessFallbackRoute = lodashGet(this.props, 'personalBankAccount.onSuccessFallbackRoute', '');

        if (exitReportID) {
            Navigation.dismissModal(exitReportID);
        } else if (shouldContinue && onSuccessFallbackRoute) {
            PaymentMethods.continueSetup(onSuccessFallbackRoute);
        } else {
            Navigation.goBack(ROUTES.SETTINGS_WALLET);
        }
    }

    render() {
        const shouldShowSuccess = lodashGet(this.props, 'personalBankAccount.shouldShowSuccess', false);

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={shouldShowSuccess}
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicator={false}
                testID={AddPersonalBankAccountPage.displayName}
            >
                <HeaderWithBackButton
                    title={this.props.translate('bankAccount.addBankAccount')}
                    onBackButtonPress={this.exitFlow}
                />
                {shouldShowSuccess ? (
                    <ConfirmationPage
                        heading={this.props.translate('addPersonalBankAccountPage.successTitle')}
                        description={this.props.translate('addPersonalBankAccountPage.successMessage')}
                        shouldShowButton
                        buttonText={this.props.translate('common.continue')}
                        onButtonPress={() => this.exitFlow(true)}
                    />
                ) : (
                    <Form
                        formID={ONYXKEYS.PERSONAL_BANK_ACCOUNT}
                        isSubmitButtonVisible={Boolean(this.state.selectedPlaidAccountID)}
                        submitButtonText={this.props.translate('common.saveAndContinue')}
                        scrollContextEnabled
                        onSubmit={this.submit}
                        validate={this.validate}
                        style={[styles.mh5, styles.flex1]}
                    >
                        <>
                            <AddPlaidBankAccount
                                onSelect={(selectedPlaidAccountID) => {
                                    this.setState({selectedPlaidAccountID});
                                }}
                                plaidData={this.props.plaidData}
                                onExitPlaid={() => Navigation.goBack(ROUTES.HOME)}
                                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                                selectedPlaidAccountID={this.state.selectedPlaidAccountID}
                            />
                        </>
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
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
    }),
)(AddPersonalBankAccountPage);
