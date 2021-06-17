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
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';

// Steps
import BankAccountStep from './BankAccountStep';
import CompanyStep from './CompanyStep';
import RequestorStep from './RequestorStep';
import ACHContractStep from './ACHContractStep';
import ValidationStep from './ValidationStep';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: PropTypes.shape({
        /** Whether we are loading the data via the API */
        loading: PropTypes.bool,

        /** A date that indicates the user has been throttled */
        throttledDate: PropTypes.string,

        /** Additional data for the account in setup */
        achData: PropTypes.shape({

            /** Step of the setup flow that we are on. Determines which view is presented. */
            currentStep: PropTypes.string,
        }),
    }),

    /** Current session for the user */
    session: PropTypes.shape({
        /** User login */
        email: PropTypes.string,
    }).isRequired,

    /** Route object from navigation */
    route: PropTypes.shape({
        /** Params that are passed into the route */
        params: PropTypes.shape({
            /** A step to navigate to if we need to drop the user into a specific point in the flow */
            stepToOpen: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {
        loading: true,
    },
    route: {
        params: {
            stepToOpen: '',
        },
    },
};

class ReimbursementAccountPage extends React.Component {
    componentDidMount() {
        fetchFreePlanVerifiedBankAccount();
    }

    /**
     * @returns {String}
     */
    getStepToOpenFromRouteParams() {
        switch (lodashGet(this.props.route, ['params', 'stepToOpen'])) {
            case 'new':
                return CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
            case 'company':
                return CONST.BANK_ACCOUNT.STEP.COMPANY;
            case 'requestor':
                return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
            case 'contract':
                return CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT;
            case 'validate':
                return CONST.BANK_ACCOUNT.STEP.VALIDATION;
            default:
                return '';
        }
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

        const userHasPhonePrimaryEmail = Str.endsWith(this.props.session.email, CONST.SMS.DOMAIN);

        if (userHasPhonePrimaryEmail) {
            return (
                <View style={[styles.m5]}>
                    <Text>{this.props.translate('bankAccount.hasPhoneLoginError')}</Text>
                </View>
            );
        }

        const throttledDate = lodashGet(this.props, 'reimbursementAccount.throttledDate');
        if (throttledDate) {
            const throttledEnd = moment().add(24, 'hours');
            if (moment() < throttledEnd) {
                return (
                    <View style={[styles.m5]}>
                        <Text>
                            {this.props.translate('bankAccount.hasBeenThrottledError', {
                                fromNow: throttledEnd.fromNow(),
                            })}
                        </Text>
                    </View>
                );
            }
        }

        // We grab the currentStep from the achData to determine which view to display. The SetupWithdrawalAccount flow
        // allows us to continue the flow from various points depending on where the user left off. We can also
        // specify a specific step to navigate to by using route params.
        // this.getStepToOpenFromRouteParams() <- @todo we need be able to determine when to use this value and when to
        // refer to the achData...
        const currentStep = this.props.reimbursementAccount.achData.currentStep;
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
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
                </KeyboardAvoidingView>
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
