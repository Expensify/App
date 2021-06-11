/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
import moment from 'moment';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../../components/ScreenWrapper';
import {fetchFreePlanVerifiedBankAccount} from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import Permissions from '../../libs/Permissions';

// Steps
import BankAccountStep from './BankAccountStep';
import CompanyStep from './CompanyStep';
import RequestorStep from './RequestorStep';
import ACHContractStep from './ACHContractStep';
import ValidationStep from './ValidationStep';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    reimbursementAccount: PropTypes.shape({
        loading: PropTypes.bool,
        throttledDate: PropTypes.string,
        achData: PropTypes.shape({
            country: PropTypes.string,
            currentStep: PropTypes.string,
        }),
    }),

    personalDetails: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
    }),

    session: PropTypes.shape({
        email: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    reimbursementAccount: {
        loading: true,
    },
    personalDetails: {},
};

class ReimbursementAccountPage extends React.Component {
    componentDidMount() {
        fetchFreePlanVerifiedBankAccount();
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            console.debug('Not showing new bank account page because user is not on free plan beta');
            Navigation.dismissModal();
            return null;
        }

        if (this.props.reimbursementAccount.loading) {
            return <FullScreenLoadingIndicator visible />;
        }

        const {achData} = this.props.reimbursementAccount;

        // In Web-Secure we check the policy to find out the defaultCountry. The policy is passed in here:
        // https://github.com/Expensify/Web-Expensify/blob/896941794f68d7dce64466d83a3e86a5f8122e45/site/app/policyEditor/policyEditorPage.jsx#L2169-L2171
        // @TODO figure out whether we need to check the policy or not - not sure if it's necessary for V1 of Free Plan
        const defaultCountry = achData.country || 'US'; // @TODO - In Web-Expensify this fallback refers to User.getIpCountry()
        const personalDetails = {firstName: this.props.personalDetails.firstName, lastName: this.props.personalDetails.lastName};
        const userHasPhonePrimaryEmail = Str.endsWith(this.props.session.email, '@expensify.sms');

        if (userHasPhonePrimaryEmail) {
            // @TODO message explaining that they need to make their primary login an email
            return null;
        }

        // See if they is throttled
        const throttledDate = lodashGet(this.props, 'reimbursementAccount.throttledDate');
        if (throttledDate) {
            const throttledEnd = moment().add(24, 'hours');
            if (moment() < throttledEnd) {
                // @TODO message explaining that the user has been throttled
                return null;
            }
        }

        // Everything we need to display UI-wise is pretty much in the achData at this point. We just need to call the correct actions in the right places when
        // submitting a form or navigating back or forward.
        const currentStep = achData.currentStep;
        return (
            <ScreenWrapper>
                {currentStep === 'BankAccountStep' && (
                    <BankAccountStep />
                )}
                {currentStep === 'CompanyStep' && (
                    <CompanyStep />
                )}
                {currentStep === 'RequestorStep' && (
                    <RequestorStep />
                )}
                {currentStep === 'ACHContractStep' && (
                    <ACHContractStep />
                )}
                {currentStep === 'ValidationStep' && (
                    <ValidationStep />
                )}
            </ScreenWrapper>
        );
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;
export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    personalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },

    // @TODO we maybe need the user policyID + currency + default country + whether plaid is disabled ??
})(ReimbursementAccountPage);
