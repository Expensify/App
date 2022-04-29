import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Log from '../../libs/Log';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import ReimbursementAccountLoadingIndicator from '../../components/ReimbursementAccountLoadingIndicator';
import Permissions from '../../libs/Permissions';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import getPlaidOAuthReceivedRedirectURI from '../../libs/getPlaidOAuthReceivedRedirectURI';
import Text from '../../components/Text';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

// Steps
import BankAccountStep from './BankAccountStep';
import CompanyStep from './CompanyStep';
import RequestorStep from './RequestorStep';
import ValidationStep from './ValidationStep';
import ACHContractStep from './ACHContractStep';
import EnableStep from './EnableStep';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Information about the network  */
    network: networkPropTypes.isRequired,

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
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            this.fetchData();
        }
        const currentStep = lodashGet(
            this.props,
            'reimbursementAccount.achData.currentStep',
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        );
        const previousStep = lodashGet(
            prevProps,
            'reimbursementAccount.achData.currentStep',
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        );

        if (currentStep === previousStep) {
            return;
        }

        // When the step changes we will navigate to update the route params. This is mostly cosmetic as we only use
        // the route params when the component first mounts to jump to a specific route instead of picking up where the
        // user left off in the flow.
        BankAccounts.hideBankAccountErrors();
        Navigation.navigate(ROUTES.getBankAccountRoute(this.getRouteForCurrentStep(currentStep)));
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
            case 'personal-information':
                return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
            case 'contract':
                return CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT;
            case 'validate':
                return CONST.BANK_ACCOUNT.STEP.VALIDATION;
            case 'enable':
                return CONST.BANK_ACCOUNT.STEP.ENABLE;
            default:
                return '';
        }
    }

    /**
     * @param {String} currentStep
     * @returns {String}
     */
    getRouteForCurrentStep(currentStep) {
        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                return 'company';
            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                return 'personal-information';
            case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
                return 'contract';
            case CONST.BANK_ACCOUNT.STEP.VALIDATION:
                return 'validate';
            case CONST.BANK_ACCOUNT.STEP.ENABLE:
                return 'enable';
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            default:
                return 'new';
        }
    }

    fetchData() {
        // We can specify a step to navigate to by using route params when the component mounts.
        const stepToOpen = this.getStepToOpenFromRouteParams();

        // If we are trying to navigate to `/bank-account/new` and we already have a bank account then don't allow returning to `/new`
        BankAccounts.fetchFreePlanVerifiedBankAccount(stepToOpen !== CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT ? stepToOpen : '');
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            Log.info('Not showing new bank account page because user is not on free plan beta');
            Navigation.dismissModal();
            return null;
        }

        // The SetupWithdrawalAccount flow allows us to continue the flow from various points depending on where the
        // user left off. This view will refer to the achData as the single source of truth to determine which route to
        // display. We can also specify a specific route to navigate to via route params when the component first
        // mounts which will set the achData.currentStep after the account data is fetched and overwrite the logical
        // next step.
        const achData = lodashGet(this.props, 'reimbursementAccount.achData', {});
        const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        if (this.props.reimbursementAccount.loading) {
            const isSubmittingVerificationsData = _.contains([
                CONST.BANK_ACCOUNT.STEP.COMPANY,
                CONST.BANK_ACCOUNT.STEP.REQUESTOR,
                CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
            ], currentStep);
            return (
                <ReimbursementAccountLoadingIndicator
                    isSubmittingVerificationsData={isSubmittingVerificationsData}
                />
            );
        }

        let errorComponent;
        const userHasPhonePrimaryEmail = Str.endsWith(this.props.session.email, CONST.SMS.DOMAIN);

        if (userHasPhonePrimaryEmail) {
            errorComponent = (
                <View style={[styles.m5]}>
                    <Text>{this.props.translate('bankAccount.hasPhoneLoginError')}</Text>
                </View>
            );
        }

        const throttledDate = lodashGet(this.props, 'reimbursementAccount.throttledDate');
        if (throttledDate) {
            errorComponent = (
                <View style={[styles.m5]}>
                    <Text>
                        {this.props.translate('bankAccount.hasBeenThrottledError')}
                    </Text>
                </View>
            );
        }

        if (errorComponent) {
            return (
                <ScreenWrapper>
                    <HeaderWithCloseButton
                        title={this.props.translate('workspace.common.bankAccount')}
                        onCloseButtonPress={Navigation.dismissModal}
                    />
                    {errorComponent}
                </ScreenWrapper>
            );
        }
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    {currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT && (
                        <BankAccountStep
                            achData={achData}
                            isPlaidDisabled={this.props.reimbursementAccount.isPlaidDisabled}
                            receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                            plaidLinkOAuthToken={this.props.plaidLinkToken}
                        />
                    )}
                    {currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY && (
                        <CompanyStep achData={achData} />
                    )}
                    {currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR && (
                        <RequestorStep achData={achData} />
                    )}
                    {currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT && (
                        <ACHContractStep companyName={achData.companyName} />
                    )}
                    {currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION && (
                        <ValidationStep />
                    )}
                    {currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE && (
                        <EnableStep
                            achData={this.props.reimbursementAccount.achData}
                        />
                    )}
                    <WorkspaceResetBankAccountModal />
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;

export default compose(
    withNetwork(),
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
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
    }),
    withLocalize,
)(ReimbursementAccountPage);
