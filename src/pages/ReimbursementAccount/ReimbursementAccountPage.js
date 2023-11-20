import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import shouldReopenOnfido from '@libs/shouldReopenOnfido';
import withPolicy from '@pages/workspace/withPolicy';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ACHContractStep from './ACHContractStep';
import BankAccountStep from './BankAccountStep';
import CompanyStep from './CompanyStep';
import ContinueBankAccountSetup from './ContinueBankAccountSetup';
import EnableStep from './EnableStep';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import RequestorStep from './RequestorStep';
import ValidationStep from './ValidationStep';

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,

    /** Indicated whether the report data is loading */
    isLoadingReportData: PropTypes.bool,

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** Information about the network  */
    network: networkPropTypes.isRequired,

    /** Current session for the user */
    session: PropTypes.shape({
        /** User login */
        email: PropTypes.string,
    }),

    /** Route object from navigation */
    route: PropTypes.shape({
        /** Params that are passed into the route */
        params: PropTypes.shape({
            /** A step to navigate to if we need to drop the user into a specific point in the flow */
            stepToOpen: PropTypes.string,
            policyID: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
    onfidoToken: '',
    plaidLinkToken: '',
    isLoadingReportData: false,
    account: {},
    session: {
        email: null,
    },
    route: {
        params: {
            stepToOpen: '',
            policyID: '',
        },
    },
};

class ReimbursementAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.continue = this.continue.bind(this);
        this.getDefaultStateForField = this.getDefaultStateForField.bind(this);
        this.goBack = this.goBack.bind(this);
        this.requestorStepRef = React.createRef();

        // The first time we open this page, props.reimbursementAccount is either not available in Onyx
        // or only partial data loaded where props.reimbursementAccount.achData.currentStep is not available
        // Calculating shouldShowContinueSetupButton on first page open doesn't make sense, and we should recalculate
        // it once we get the response from the server the first time in componentDidUpdate.
        const hasACHDataBeenLoaded =
            this.props.reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps && _.has(this.props.reimbursementAccount, 'achData.currentStep');
        this.state = {
            hasACHDataBeenLoaded,
            shouldShowContinueSetupButton: hasACHDataBeenLoaded ? this.getShouldShowContinueSetupButtonInitialValue() : false,
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.network.isOffline && !this.props.network.isOffline && prevProps.reimbursementAccount.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            this.fetchData();
        }
        if (!this.state.hasACHDataBeenLoaded) {
            // If the ACHData has not been loaded yet, and we are seeing the default data for props.reimbursementAccount
            // We don't need to do anything yet
            if (this.props.reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps && !this.props.reimbursementAccount.isLoading) {
                // If we are here, it is because this is the first time we load the ACHData from the server and
                // this.props.reimbursementAccount.isLoading just changed to false. From now on, it makes sense to run the code
                // below updating states and the route, and this will happen in the next react lifecycle.
                this.setState({
                    shouldShowContinueSetupButton: this.getShouldShowContinueSetupButtonInitialValue(),
                    hasACHDataBeenLoaded: true,
                });
            }
            return;
        }

        if (
            prevProps.reimbursementAccount.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            this.props.reimbursementAccount.pendingAction !== prevProps.reimbursementAccount.pendingAction
        ) {
            // We are here after the user tried to delete the bank account. We will want to set
            // this.state.shouldShowContinueSetupButton to `false` if the bank account was deleted.
            this.setState({shouldShowContinueSetupButton: this.hasInProgressVBBA()});
        }

        const currentStep = lodashGet(this.props.reimbursementAccount, 'achData.currentStep') || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;

        if (this.state.shouldShowContinueSetupButton) {
            // If we are showing the "Continue with setup" / "Start over" buttons:
            // - We don't want to update the route in case the user reloads the page. If we update the route and the user reloads, we will
            //   take the user to the step set in the route and skip chosing the options.
            // - We don't want to clear possible errors because we want to allow the user to clear them clicking the X
            return;
        }

        // Update the data that is returned from back-end to draft value
        const draftStep = this.props.reimbursementAccount.draftStep;
        if (draftStep) {
            BankAccounts.updateReimbursementAccountDraft(this.getBankAccountFields(this.getFieldsForStep(draftStep)));
        }

        const currentStepRouteParam = this.getStepToOpenFromRouteParams();
        if (currentStepRouteParam === currentStep) {
            // The route is showing the correct step, no need to update the route param or clear errors.
            return;
        }
        if (currentStepRouteParam !== '') {
            // When we click "Connect bank account", we load the page without the current step param, if there
            // was an error when we tried to disconnect or start over, we want the user to be able to see the error,
            // so we don't clear it. We only want to clear the errors if we are moving between steps.
            BankAccounts.hideBankAccountErrors();
        }

        // When the step changes we will navigate to update the route params. This is mostly cosmetic as we only use
        // the route params when the component first mounts to jump to a specific route instead of picking up where the
        // user left off in the flow.
        const backTo = lodashGet(this.props.route.params, 'backTo');
        const policyId = lodashGet(this.props.route.params, 'policyID');
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(this.getRouteForCurrentStep(currentStep), policyId, backTo));
    }

    componentWillUnmount() {
        BankAccounts.clearReimbursementAccount();
    }

    getFieldsForStep(step) {
        switch (step) {
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
                return ['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings'];
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                return [
                    'companyName',
                    'addressStreet',
                    'addressZipCode',
                    'addressCity',
                    'addressState',
                    'companyPhone',
                    'website',
                    'companyTaxID',
                    'incorporationType',
                    'incorporationDate',
                    'incorporationState',
                ];
            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                return ['firstName', 'lastName', 'dob', 'ssnLast4', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState', 'requestorAddressZipCode'];
            default:
                return [];
        }
    }

    /**
     * @param {Array} fieldNames
     *
     * @returns {*}
     */
    getBankAccountFields(fieldNames) {
        return {
            ..._.pick(lodashGet(this.props.reimbursementAccount, 'achData'), ...fieldNames),
        };
    }

    /*
     * Calculates the state used to show the "Continue with setup" view. If a bank account setup is already in progress and
     * no specific further step was passed in the url we'll show the workspace bank account reset modal if the user wishes to start over
     */
    getShouldShowContinueSetupButtonInitialValue() {
        if (!this.hasInProgressVBBA()) {
            // Since there is no VBBA in progress, we won't need to show the component ContinueBankAccountSetup
            return false;
        }
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
        return achData.state === BankAccount.STATE.PENDING || _.contains([CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, ''], this.getStepToOpenFromRouteParams());
    }

    /**
     * @param {String} fieldName
     * @param {*} defaultValue
     *
     * @returns {*}
     */
    getDefaultStateForField(fieldName, defaultValue = '') {
        return lodashGet(this.props.reimbursementAccount, ['achData', fieldName], defaultValue);
    }

    /**
     * We can pass stepToOpen in the URL to force which step to show.
     * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
     * @returns {String}
     */
    getStepToOpenFromRouteParams() {
        switch (lodashGet(this.props.route, ['params', 'stepToOpen'], '')) {
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
     * Returns true if a VBBA exists in any state other than OPEN or LOCKED
     * @returns {Boolean}
     */
    hasInProgressVBBA() {
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
        return achData.bankAccountID && achData.state !== BankAccount.STATE.OPEN && achData.state !== BankAccount.STATE.LOCKED;
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
            shouldShowContinueSetupButton: false,
        });
        this.fetchData(true);
    }

    goBack() {
        const achData = lodashGet(this.props.reimbursementAccount, 'achData', {});
        const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        const subStep = achData.subStep;
        const shouldShowOnfido = this.props.onfidoToken && !achData.isOnfidoSetupComplete;
        const backTo = lodashGet(this.props.route.params, 'backTo', ROUTES.HOME);
        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
                if (this.hasInProgressVBBA()) {
                    this.setState({shouldShowContinueSetupButton: true});
                }
                if (subStep) {
                    BankAccounts.setBankAccountSubStep(null);
                    BankAccounts.setPlaidEvent(null);
                } else {
                    Navigation.goBack(backTo);
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
                } else if (!this.props.network.isOffline && achData.state === BankAccount.STATE.PENDING) {
                    this.setState({
                        shouldShowContinueSetupButton: true,
                    });
                } else {
                    Navigation.goBack(backTo);
                }
                break;
            default:
                Navigation.goBack(backTo);
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
        const policyName = lodashGet(this.props.policy, 'name');
        const policyID = lodashGet(this.props.route.params, 'policyID');

        if (_.isEmpty(this.props.policy) || !PolicyUtils.isPolicyAdmin(this.props.policy)) {
            return (
                <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
                    <FullPageNotFoundView
                        shouldShow
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                        subtitleKey={_.isEmpty(this.props.policy) ? undefined : 'workspace.common.notAuthorized'}
                    />
                </ScreenWrapper>
            );
        }
        const isLoading =
            (this.props.isLoadingReportData || this.props.account.isLoading || this.props.reimbursementAccount.isLoading) &&
            (!this.props.plaidCurrentEvent || this.props.plaidCurrentEvent === CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.EXIT);

        // Prevent the full-page blocking offline view from being displayed for these steps if the device goes offline.
        const shouldShowOfflineLoader = !(
            this.props.network.isOffline &&
            _.contains([CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, CONST.BANK_ACCOUNT.STEP.COMPANY, CONST.BANK_ACCOUNT.STEP.REQUESTOR, CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT], currentStep)
        );

        // Show loading indicator when page is first time being opened and props.reimbursementAccount yet to be loaded from the server
        // or when data is being loaded. Don't show the loading indicator if we're offline and restarted the bank account setup process
        // On Android, when we open the app from the background, Onfido activity gets destroyed, so we need to reopen it.
        if ((!this.state.hasACHDataBeenLoaded || isLoading) && shouldShowOfflineLoader && (shouldReopenOnfido || !this.requestorStepRef.current)) {
            const isSubmittingVerificationsData = _.contains([CONST.BANK_ACCOUNT.STEP.COMPANY, CONST.BANK_ACCOUNT.STEP.REQUESTOR, CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT], currentStep);
            return (
                <ReimbursementAccountLoadingIndicator
                    isSubmittingVerificationsData={isSubmittingVerificationsData}
                    onBackButtonPress={this.goBack}
                />
            );
        }

        let errorText;
        const userHasPhonePrimaryEmail = Str.endsWith(this.props.session.email, CONST.SMS.DOMAIN);
        const throttledDate = lodashGet(this.props.reimbursementAccount, 'throttledDate');
        const hasUnsupportedCurrency = lodashGet(this.props.policy, 'outputCurrency', '') !== CONST.CURRENCY.USD;

        if (userHasPhonePrimaryEmail) {
            errorText = this.props.translate('bankAccount.hasPhoneLoginError');
        } else if (throttledDate) {
            errorText = this.props.translate('bankAccount.hasBeenThrottledError');
        } else if (hasUnsupportedCurrency) {
            errorText = this.props.translate('bankAccount.hasCurrencyError');
        }

        if (errorText) {
            return (
                <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
                    <HeaderWithBackButton
                        title={this.props.translate('workspace.common.connectBankAccount')}
                        subtitle={policyName}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                    />

                    <View style={[this.props.themeStyles.m5, this.props.themeStyles.mv3, this.props.themeStyles.flex1]}>
                        <Text>{errorText}</Text>
                    </View>
                </ScreenWrapper>
            );
        }

        if (this.state.shouldShowContinueSetupButton) {
            return (
                <ContinueBankAccountSetup
                    reimbursementAccount={this.props.reimbursementAccount}
                    continue={this.continue}
                    policyName={policyName}
                    onBackButtonPress={() => {
                        Navigation.goBack(lodashGet(this.props.route.params, 'backTo', ROUTES.HOME));
                    }}
                />
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
                    policyName={policyName}
                    policyID={policyID}
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
                    policyID={policyID}
                />
            );
        }

        if (currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
            const shouldShowOnfido = this.props.onfidoToken && !achData.isOnfidoSetupComplete;
            return (
                <RequestorStep
                    ref={this.requestorStepRef}
                    reimbursementAccount={this.props.reimbursementAccount}
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
                <EnableStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    policyName={policyName}
                    onBackButtonPress={this.goBack}
                />
            );
        }
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;
ReimbursementAccountPage.displayName = 'ReimbursementAccountPage';

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
        plaidCurrentEvent: {
            key: ONYXKEYS.PLAID_CURRENT_EVENT,
        },
        onfidoToken: {
            key: ONYXKEYS.ONFIDO_TOKEN,
        },
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
    withLocalize,
    withPolicy,
    withThemeStyles,
)(ReimbursementAccountPage);
