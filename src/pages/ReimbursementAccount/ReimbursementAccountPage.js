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
import BankAccountStep from './BankAccountStep';
import CompanyStep from './CompanyStep';
import ContinueBankAccountSetup from './ContinueBankAccountSetup';
import RequestorStep from './RequestorStep';
import ValidationStep from './ValidationStep';
import ACHContractStep from './ACHContractStep';
import EnableStep from './EnableStep';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import WorkspaceResetBankAccountModal from '../workspace/WorkspaceResetBankAccountModal';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,

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
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
    onfidoToken: '',
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
        this.getDefaultStateForField = this.getDefaultStateForField.bind(this);
        this.goBack = this.goBack.bind(this);
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
        const hasInProgressVBBA = achData.bankAccountID && achData.state !== BankAccount.STATE.OPEN && achData.state !== BankAccount.STATE.LOCKED;

        this.state = {
            shouldHideContinueSetupButton: !hasInProgressVBBA,
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            this.fetchData();
        }
        const currentStep = lodashGet(this.props.reimbursementAccount, 'achData.currentStep') || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        const previousStep = lodashGet(prevProps.reimbursementAccount, 'achData.currentStep') || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
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
     * @param {String} fieldName
     * @param {*} defaultValue
     *
     * @returns {*}
     */
    getDefaultStateForField(fieldName, defaultValue = '') {
        return ReimbursementAccountUtils.getDefaultStateForField(this.props.reimbursementAccountDraft, this.props.reimbursementAccount, fieldName, defaultValue);
    }

    /**
     * We can pass stepToOpen in the URL to force which step to show.
     * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
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

    /**
     * Retrieve verified business bank account currently being set up.
     * @param {boolean} ignoreLocalCurrentStep Pass true if you want the last "updated" view (from db), not the last "viewed" view (from onyx).
     */
    fetchData(ignoreLocalCurrentStep) {
        // Show loader right away, as optimisticData might be set only later in case multiple calls are in the queue
        BankAccounts.setReimbursementAccountLoading(true);

        // We can specify a step to navigate to by using route params when the component mounts.
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = this.getStepToOpenFromRouteParams();
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
        const subStep = achData.subStep || '';
        const localCurrentStep = achData.currentStep || '';
        BankAccounts.openReimbursementAccountPage(stepToOpen, subStep, ignoreLocalCurrentStep ? '' : localCurrentStep);
    }

    continue() {
        this.setState({
            shouldHideContinueSetupButton: true,
        });
        this.fetchData(true);
    }

    goBack() {
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
        const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        const subStep = achData.subStep;
        const shouldShowOnfido = this.props.onfidoToken && !achData.isOnfidoSetupComplete;
        const hasInProgressVBBA = achData.bankAccountID && achData.state !== BankAccount.STATE.OPEN && achData.state !== BankAccount.STATE.LOCKED;
        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
                if (hasInProgressVBBA) {
                    this.setState({shouldHideContinueSetupButton: false});
                }
                if (subStep) {
                    BankAccounts.setBankAccountSubStep(null);
                } else {
                    Navigation.goBack();
                }
                break;
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, {subStep: CONST.BANK_ACCOUNT.SUBSTEP.MANUAL});
                break;
            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                if (shouldShowOnfido) {
                    BankAccounts.clearOnfidoToken();
                } else {
                    BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                }
                break;
            case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
                BankAccounts.clearOnfidoToken();
                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                break;
            case CONST.BANK_ACCOUNT.STEP.VALIDATION:
                if (_.contains([BankAccount.STATE.VERIFYING, BankAccount.STATE.SETUP], achData.state)) {
                    BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT);
                } else if (achData.state === BankAccount.STATE.PENDING) {
                    this.setState({
                        shouldHideContinueSetupButton: false,
                    });
                } else {
                    Navigation.goBack();
                }
                break;
            default: Navigation.goBack();
        }
    }

    render() {
        // The SetupWithdrawalAccount flow allows us to continue the flow from various points depending on where the
        // user left off. This view will refer to the achData as the single source of truth to determine which route to
        // display. We can also specify a specific route to navigate to via route params when the component first
        // mounts which will set the achData.currentStep after the account data is fetched and overwrite the logical
        // next step.
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
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
                    onBackButtonPress={this.goBack}
                />
            );
        }

        // Show the "Continue with setup" button if a bank account setup is already in progress and no specific further step was passed in the url
        // We'll show the workspace bank account reset modal if the user wishes to start over
        if (!this.state.shouldHideContinueSetupButton
            && Boolean(achData.bankAccountID)
            && achData.state !== BankAccount.STATE.OPEN
            && achData.state !== BankAccount.STATE.LOCKED
            && (
                _.contains([CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, ''], this.getStepToOpenFromRouteParams())
                || achData.state === BankAccount.STATE.PENDING
            )) {
            return (
                <View>
                    <ContinueBankAccountSetup
                        continue={this.continue}
                        startOver={() => {
                            BankAccounts.requestResetFreePlanBankAccount();
                        }}
                    />
                    {this.props.reimbursementAccount.shouldShowResetModal && (
                        <WorkspaceResetBankAccountModal
                            reimbursementAccount={this.props.reimbursementAccount}
                            onConfirm={() => this.setState({shouldHideContinueSetupButton: true})}
                        />
                    )}
                </View>
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

        const throttledDate = lodashGet(this.props.reimbursementAccount, 'throttledDate');
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

        if (currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT) {
            return (
                <BankAccountStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    reimbursementAccountDraft={this.props.reimbursementAccountDraft}
                    onBackButtonPress={this.goBack}
                    receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                    plaidLinkOAuthToken={this.props.plaidLinkToken}
                    getDefaultStateForField={this.getDefaultStateForField}
                />
            );
        }

        if (currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY) {
            return (
                <CompanyStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    reimbursementAccountDraft={this.props.reimbursementAccountDraft}
                    onBackButtonPress={this.goBack}
                    getDefaultStateForField={this.getDefaultStateForField}
                />
            );
        }

        if (currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
            const shouldShowOnfido = this.props.onfidoToken && !achData.isOnfidoSetupComplete;
            return (
                <RequestorStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    reimbursementAccountDraft={this.props.reimbursementAccountDraft}
                    onBackButtonPress={this.goBack}
                    shouldShowOnfido={Boolean(shouldShowOnfido)}
                    getDefaultStateForField={this.getDefaultStateForField}
                />
            );
        }

        if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT) {
            return (
                <ACHContractStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    reimbursementAccountDraft={this.props.reimbursementAccountDraft}
                    onBackButtonPress={this.goBack}
                    companyName={achData.companyName}
                    getDefaultStateForField={this.getDefaultStateForField}
                />
            );
        }

        if (currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION) {
            return (
                <ValidationStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    onBackButtonPress={this.goBack}
                />
            );
        }

        if (currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE) {
            return (
                <EnableStep reimbursementAccount={this.props.reimbursementAccount} />
            );
        }
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
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
        onfidoToken: {
            key: ONYXKEYS.ONFIDO_TOKEN,
        },
    }),
    withLocalize,
)(ReimbursementAccountPage);
