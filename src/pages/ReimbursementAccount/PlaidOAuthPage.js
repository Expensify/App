import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import ScreenWrapper from '../../components/ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import {addPersonalBankAccount} from '../../libs/actions/BankAccounts';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import ReimbursementAccountPage from './ReimbursementAccountPage';

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const PlaidOAuthPage = (props) => {
    let receivedRedirectURI = window.location.href;
    const receivedRedirectSearchParams = (new URL(receivedRedirectURI)).searchParams;
    const oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');
    const bankAccountType = lodashGet(props.route, ['params', 'bankAccountType']);

    // If there's no stateID passed, then return user to start of Plaid flow by setting the redirectURI to null
    if (!oauthStateID) {
        receivedRedirectURI = null;
    }

    return (
        <ScreenWrapper>
            {bankAccountType === CONST.BANK_ACCOUNT.BUSINESS ? (
                <ReimbursementAccountPage
                    receivedRedirectURI={receivedRedirectURI}
                    existingPlaidLinkToken={props.plaidLinkToken}
                />
            ) : (
                <AddPlaidBankAccount
                    onSubmit={({account, password, plaidLinkToken}) => {
                        addPersonalBankAccount(account, password, plaidLinkToken);
                    }}
                    onExitPlaid={Navigation.dismissModal}
                    isBusinessBankAccount={false}
                    existingPlaidLinkToken={props.plaidLinkToken}
                    receivedRedirectURI={receivedRedirectURI}
                />
            )}
        </ScreenWrapper>
    );
};

PlaidOAuthPage.propTypes = propTypes;
PlaidOAuthPage.displayName = 'PlaidOAuthPage';
export default compose(
    withLocalize,
    withOnyx({
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(PlaidOAuthPage);
