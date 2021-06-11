/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
import moment from 'moment';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {View, Text} from 'react-native';
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
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

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

    ...withLocalizePropTypes,
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
        const userHasPhonePrimaryEmail = Str.endsWith(this.props.session.email, CONST.SMS.DOMAIN);

        if (userHasPhonePrimaryEmail) {
            return (
                <View>
                    <Text>To add a verified bank account please ensure your primary login is a valid email and try again. You can add your phone number as a secondary login.</Text>
                </View>
            );
        }

        const throttledDate = lodashGet(this.props, 'reimbursementAccount.throttledDate');
        if (throttledDate) {
            const throttledEnd = moment().add(24, 'hours');
            if (moment() < throttledEnd) {
                return (
                    <View>
                        <Text>
                            For security reasons, we&apos;re taking a break from bank account setup so you can double-check your company information. Please try again
                            {' '}
                            {throttledEnd.fromNow()}
                            . Sorry!
                        </Text>
                    </View>
                );
            }
        }

        // Everything we need to display UI-wise is pretty much in the achData at this point. We just need to call the correct actions in the right places when
        // submitting a form or navigating back or forward.
        const currentStep = achData.currentStep;
        return (
            <ScreenWrapper>
                {currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT && (
                    <BankAccountStep />
                )}
                {currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY && (
                    <CompanyStep />
                )}
                {currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR && (
                    <RequestorStep />
                )}
                {currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT && (
                    <ACHContractStep />
                )}
                {currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION && (
                    <ValidationStep />
                )}
            </ScreenWrapper>
        );
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
    withLocalize,
)(ReimbursementAccountPage);
