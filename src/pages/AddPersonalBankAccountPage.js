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
import ROUTES from '../ROUTES';

const propTypes = {
    ...withLocalizePropTypes,

    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether we should show the view that the bank account was successfully added */
        shouldShowSuccess: PropTypes.bool,

        /** Whether the form is loading */
        isLoading: PropTypes.bool,

        /** The account ID of the selected bank account from Plaid */
        plaidAccountID: PropTypes.string,
    }),
};

const defaultProps = {
    personalBankAccount: {
        error: '',
        shouldShowSuccess: false,
        isLoading: false,
        plaidAccountID: '',
    },
};

class AddPersonalBankAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            selectedPlaidAccountID: '',
        };
    }

    componentDidMount() {
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

    render() {
        const shouldShowSuccess = lodashGet(this.props, 'personalBankAccount.shouldShowSuccess', false);

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('bankAccount.addBankAccount')}
                    onCloseButtonPress={Navigation.dismissModal}
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
                                <Text style={[styles.mt5, styles.h1, styles.textAlignCenter, styles.headlineFont, styles.textXLarge]}>
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
                        isSubmitButtonVisible={Boolean(this.state.selectedPlaidAccountID)}
                        submitButtonText={this.props.translate('common.saveAndContinue')}
                        onSubmit={this.submit}
                        validate={this.validate}
                        style={[styles.mh5, styles.flex1]}
                    >
                        <>
                            <AddPlaidBankAccount
                                onSelect={(selectedPlaidAccountID) => {
                                    this.setState({selectedPlaidAccountID});
                                }}
                                onExitPlaid={Navigation.goBack}
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
