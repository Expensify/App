import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import ReimbursementAccountLoadingIndicator from '../../components/ReimbursementAccountLoadingIndicator';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import BankAccount from '../../libs/models/BankAccount';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import getPlaidOAuthReceivedRedirectURI from '../../libs/getPlaidOAuthReceivedRedirectURI';
import Text from '../../components/Text';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import * as store from '../../libs/actions/ReimbursementAccount/store';

// Steps
import BankAccountStep from './BankAccountStep';
import CompanyStep from './CompanyStep';
import ContinueBankAccountSetup from './ContinueBankAccountSetup';
import RequestorStep from './RequestorStep';
import ValidationStep from './ValidationStep';
import ACHContractStep from './ACHContractStep';
import EnableStep from './EnableStep';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

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
        isLoading: true,
    },
    plaidLinkToken: '',
    route: {
        params: {
            stepToOpen: '',
        },
    },
};

class ReimbursementAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.continue = this.continue.bind(this);

        const achData = lodashGet(this.props, 'reimbursementAccount.achData', {});
        const hasInProgressVBBA = achData.bankAccountID && achData.state !== BankAccount.STATE.OPEN;
        this.state = {
            shouldShowContinueSetupButton: hasInProgressVBBA,
        };
    }

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
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = this.getStepToOpenFromRouteParams();
        const reimbursementAccount = store.getReimbursementAccountInSetup();
        const subStep = reimbursementAccount.subStep || '';
        const localCurrentStep = reimbursementAccount.currentStep || '';
        BankAccounts.openReimbursementAccountPage(stepToOpen, subStep, localCurrentStep);
    }

    continue() {
        this.setState({
            shouldShowContinueSetupButton: false,
        });
    }

    render() {
        // The SetupWithdrawalAccount flow allows us to continue the flow from various points depending on where the
        // user left off. This view will refer to the achData as the single source of truth to determine which route to
        // display. We can also specify a specific route to navigate to via route params when the component first
        // mounts which will set the achData.currentStep after the account data is fetched and overwrite the logical
        // next step.
        const achData = lodashGet(this.props, 'reimbursementAccount.achData', {});
        const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        if (this.props.reimbursementAccount.isLoading) {
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

        const hasInProgressVBBA = achData.bankAccountID && achData.state !== BankAccount.STATE.OPEN;
        if (hasInProgressVBBA && this.state.shouldShowContinueSetupButton) {
            return (
                <ContinueBankAccountSetup
                    continue={this.continue}
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
            <ScreenWrapper
                includePaddingBottom={false}
            >
                {({paddingBottom}) => (
                    <>
                        {currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT && (
                            <BankAccountStep
                                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                                plaidLinkOAuthToken={this.props.plaidLinkToken}
                                onSubStepBack={() => (hasInProgressVBBA ? this.setState({shouldShowContinueSetupButton: true}) : BankAccounts.setBankAccountSubStep(null))}
                                paddingBottom={paddingBottom}
                            />
                        )}
                        {currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY && (
                            <CompanyStep paddingBottom={paddingBottom} />
                        )}
                        {currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR && (
                            <RequestorStep paddingBottom={paddingBottom} />
                        )}
                        {currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT && (
                            <ACHContractStep companyName={achData.companyName} paddingBottom={paddingBottom} />
                        )}
                        {currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION && (
                            <ValidationStep />
                        )}
                        {currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE && (
                            <EnableStep />
                        )}
                        <WorkspaceResetBankAccountModal />
                    </>
                )}
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
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
    }),
    withLocalize,
)(ReimbursementAccountPage);
