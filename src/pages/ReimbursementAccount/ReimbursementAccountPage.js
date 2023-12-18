import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
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

    /** Plaid SDK current event */
    plaidCurrentEvent: PropTypes.string,

    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** The token required to initialize the Onfido SDK */
    onfidoToken: PropTypes.string,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }),

    /** Indicated whether the app is loading */
    isLoadingApp: PropTypes.bool,

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

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
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
    onfidoToken: '',
    policy: {},
    plaidLinkToken: '',
    plaidCurrentEvent: '',
    isLoadingApp: false,
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

const ROUTE_NAMES = {
    COMPANY: 'company',
    PERSONAL_INFORMATION: 'personal-information',
    CONTRACT: 'contract',
    VALIDATE: 'validate',
    ENABLE: 'enable',
    NEW: 'new',
};

/**
 * We can pass stepToOpen in the URL to force which step to show.
 * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
 * @param {Object} route
 * @returns {String}
 */
function getStepToOpenFromRouteParams(route) {
    switch (lodashGet(route, ['params', 'stepToOpen'], '')) {
        case ROUTE_NAMES.NEW:
            return CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        case ROUTE_NAMES.COMPANY:
            return CONST.BANK_ACCOUNT.STEP.COMPANY;
        case ROUTE_NAMES.PERSONAL_INFORMATION:
            return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
        case ROUTE_NAMES.CONTRACT:
            return CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT;
        case ROUTE_NAMES.VALIDATE:
            return CONST.BANK_ACCOUNT.STEP.VALIDATION;
        case ROUTE_NAMES.ENABLE:
            return CONST.BANK_ACCOUNT.STEP.ENABLE;
        default:
            return '';
    }
}

/**
 * @param {String} currentStep
 * @returns {String}
 */
function getRouteForCurrentStep(currentStep) {
    switch (currentStep) {
        case CONST.BANK_ACCOUNT.STEP.COMPANY:
            return ROUTE_NAMES.COMPANY;
        case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
            return ROUTE_NAMES.PERSONAL_INFORMATION;
        case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
            return ROUTE_NAMES.CONTRACT;
        case CONST.BANK_ACCOUNT.STEP.VALIDATION:
            return ROUTE_NAMES.VALIDATE;
        case CONST.BANK_ACCOUNT.STEP.ENABLE:
            return ROUTE_NAMES.ENABLE;
        case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
        default:
            return ROUTE_NAMES.NEW;
    }
}

function ReimbursementAccountPage({reimbursementAccount, route, onfidoToken, policy, account, isLoadingApp, session, plaidLinkToken, plaidCurrentEvent, reimbursementAccountDraft}) {
    /**
        The SetupWithdrawalAccount flow allows us to continue the flow from various points depending on where the
        user left off. This view will refer to the achData as the single source of truth to determine which route to
        display. We can also specify a specific route to navigate to via route params when the component first
        mounts which will set the achData.currentStep after the account data is fetched and overwrite the logical
        next step.
    */
    const achData = lodashGet(reimbursementAccount, 'achData', {});

    /**
     * @param {Array} fieldNames
     *
     * @returns {Object}
     */
    function getBankAccountFields(fieldNames) {
        return {
            ..._.pick(lodashGet(reimbursementAccount, 'achData'), ...fieldNames),
        };
    }

    /**
     * Returns selected bank account fields based on field names provided.
     *
     * @param {string} step
     * @returns {Array<string>}
     */
    function getFieldsForStep(step) {
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

    // Update the data that is returned from back-end to draft value
    const draftStep = reimbursementAccount.draftStep;
    if (draftStep) {
        BankAccounts.updateReimbursementAccountDraft(getBankAccountFields(getFieldsForStep(draftStep)));
    }

    /**
     * Returns true if a VBBA exists in any state other than OPEN or LOCKED
     * @returns {Boolean}
     */
    function hasInProgressVBBA() {
        return achData.bankAccountID && achData.state !== BankAccount.STATE.OPEN && achData.state !== BankAccount.STATE.LOCKED;
    }
    /*
     * Calculates the state used to show the "Continue with setup" view. If a bank account setup is already in progress and
     * no specific further step was passed in the url we'll show the workspace bank account reset modal if the user wishes to start over
     */
    function getShouldShowContinueSetupButtonInitialValue() {
        if (!hasInProgressVBBA()) {
            // Since there is no VBBA in progress, we won't need to show the component ContinueBankAccountSetup
            return false;
        }
        return achData.state === BankAccount.STATE.PENDING || _.contains([CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, ''], getStepToOpenFromRouteParams(route));
    }

    /**
        When this page is first opened, `reimbursementAccount` prop might not yet be fully loaded from Onyx
        or could be partially loaded such that `reimbursementAccount.achData.currentStep` is unavailable.
        Calculating `shouldShowContinueSetupButton` immediately on initial render doesn't make sense as
        it relies on complete data. Thus, we should wait to calculate it until we have received
        the full `reimbursementAccount` data from the server. This logic is handled within the useEffect hook,
        which acts similarly to `componentDidUpdate` when the `reimbursementAccount` dependency changes.
     */
    const [hasACHDataBeenLoaded, setHasACHDataBeenLoaded] = useState(
        reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps && _.has(reimbursementAccount, 'achData.currentStep'),
    );

    const [shouldShowContinueSetupButton, setShouldShowContinueSetupButton] = useState(hasACHDataBeenLoaded ? getShouldShowContinueSetupButtonInitialValue() : false);

    const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    const policyName = lodashGet(policy, 'name', '');
    const policyID = lodashGet(route.params, 'policyID', '');
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const requestorStepRef = useRef(null);
    const prevReimbursementAccount = usePrevious(reimbursementAccount);
    const prevIsOffline = usePrevious(isOffline);

    /**
     * Retrieve verified business bank account currently being set up.
     * @param {boolean} ignoreLocalCurrentStep Pass true if you want the last "updated" view (from db), not the last "viewed" view (from onyx).
     */
    function fetchData(ignoreLocalCurrentStep) {
        // Show loader right away, as optimisticData might be set only later in case multiple calls are in the queue
        BankAccounts.setReimbursementAccountLoading(true);

        // We can specify a step to navigate to by using route params when the component mounts.
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = getStepToOpenFromRouteParams(route);
        const subStep = achData.subStep || '';
        const localCurrentStep = achData.currentStep || '';
        BankAccounts.openReimbursementAccountPage(stepToOpen, subStep, ignoreLocalCurrentStep ? '' : localCurrentStep);
    }

    useEffect(
        () => {
            fetchData();
            return () => {
                BankAccounts.clearReimbursementAccount();
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    ); // The empty dependency array ensures this runs only once after the component mounts.

    useEffect(
        () => {
            // Check for network change from offline to online
            if (prevIsOffline && !isOffline && prevReimbursementAccount && prevReimbursementAccount.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                fetchData();
            }

            if (!hasACHDataBeenLoaded) {
                if (reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps && reimbursementAccount.isLoading === false) {
                    setShouldShowContinueSetupButton(getShouldShowContinueSetupButtonInitialValue());
                    setHasACHDataBeenLoaded(true);
                }
                return;
            }

            if (
                prevReimbursementAccount &&
                prevReimbursementAccount.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                reimbursementAccount.pendingAction !== prevReimbursementAccount.pendingAction
            ) {
                setShouldShowContinueSetupButton(hasInProgressVBBA());
            }

            if (shouldShowContinueSetupButton) {
                return;
            }

            const currentStepRouteParam = getStepToOpenFromRouteParams(route);
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

            const backTo = lodashGet(route.params, 'backTo');
            const policyId = lodashGet(route.params, 'policyID');

            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(getRouteForCurrentStep(currentStep), policyId, backTo));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOffline, reimbursementAccount, route, hasACHDataBeenLoaded, shouldShowContinueSetupButton],
    );

    const continueFunction = () => {
        setShouldShowContinueSetupButton(false);
        fetchData(true);
    };

    /**
     * @param {String} fieldName
     * @param {String} defaultValue
     *
     * @returns {String}
     */
    const getDefaultStateForField = (fieldName, defaultValue = '') => lodashGet(reimbursementAccount, ['achData', fieldName], defaultValue);

    const goBack = () => {
        const subStep = achData.subStep;
        const shouldShowOnfido = onfidoToken && !achData.isOnfidoSetupComplete;
        const backTo = lodashGet(route.params, 'backTo', ROUTES.HOME);

        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
                if (hasInProgressVBBA()) {
                    setShouldShowContinueSetupButton(true);
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
                } else if (!isOffline && achData.state === BankAccount.STATE.PENDING) {
                    setShouldShowContinueSetupButton(true);
                } else {
                    Navigation.goBack(backTo);
                }
                break;

            default:
                Navigation.goBack(backTo);
        }
    };

    if (_.isEmpty(policy) || !PolicyUtils.isPolicyAdmin(policy)) {
        return (
            <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
                <FullPageNotFoundView
                    shouldShow
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                    subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
                />
            </ScreenWrapper>
        );
    }

    const isLoading = (isLoadingApp || account.isLoading || reimbursementAccount.isLoading) && (!plaidCurrentEvent || plaidCurrentEvent === CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.EXIT);
    const shouldShowOfflineLoader = !(
        isOffline && _.contains([CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, CONST.BANK_ACCOUNT.STEP.COMPANY, CONST.BANK_ACCOUNT.STEP.REQUESTOR, CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT], currentStep)
    );

    // Show loading indicator when page is first time being opened and props.reimbursementAccount yet to be loaded from the server
    // or when data is being loaded. Don't show the loading indicator if we're offline and restarted the bank account setup process
    // On Android, when we open the app from the background, Onfido activity gets destroyed, so we need to reopen it.
    if ((!hasACHDataBeenLoaded || isLoading) && shouldShowOfflineLoader && (shouldReopenOnfido || !requestorStepRef.current)) {
        const isSubmittingVerificationsData = _.contains([CONST.BANK_ACCOUNT.STEP.COMPANY, CONST.BANK_ACCOUNT.STEP.REQUESTOR, CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT], currentStep);
        return (
            <ReimbursementAccountLoadingIndicator
                isSubmittingVerificationsData={isSubmittingVerificationsData}
                onBackButtonPress={goBack}
            />
        );
    }

    let errorText;
    const userHasPhonePrimaryEmail = Str.endsWith(session.email, CONST.SMS.DOMAIN);
    const throttledDate = lodashGet(reimbursementAccount, 'throttledDate', '');
    const hasUnsupportedCurrency = lodashGet(policy, 'outputCurrency', '') !== CONST.CURRENCY.USD;

    if (userHasPhonePrimaryEmail) {
        errorText = translate('bankAccount.hasPhoneLoginError');
    } else if (throttledDate) {
        errorText = translate('bankAccount.hasBeenThrottledError');
    } else if (hasUnsupportedCurrency) {
        errorText = translate('bankAccount.hasCurrencyError');
    }

    if (errorText) {
        return (
            <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
                <HeaderWithBackButton
                    title={translate('workspace.common.connectBankAccount')}
                    subtitle={policyName}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                />
                <View style={[styles.m5, styles.mv3, styles.flex1]}>
                    <Text>{errorText}</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (shouldShowContinueSetupButton) {
        return (
            <ContinueBankAccountSetup
                reimbursementAccount={reimbursementAccount}
                continue={continueFunction}
                policyName={policyName}
                onBackButtonPress={() => {
                    Navigation.goBack(lodashGet(route.params, 'backTo', ROUTES.HOME));
                }}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT) {
        return (
            <BankAccountStep
                reimbursementAccount={reimbursementAccount}
                reimbursementAccountDraft={reimbursementAccountDraft}
                onBackButtonPress={goBack}
                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                plaidLinkOAuthToken={plaidLinkToken}
                getDefaultStateForField={getDefaultStateForField}
                policyName={policyName}
                policyID={policyID}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY) {
        return (
            <CompanyStep
                reimbursementAccount={reimbursementAccount}
                reimbursementAccountDraft={reimbursementAccountDraft}
                onBackButtonPress={goBack}
                getDefaultStateForField={getDefaultStateForField}
                policyID={policyID}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
        const shouldShowOnfido = onfidoToken && !achData.isOnfidoSetupComplete;
        return (
            <RequestorStep
                ref={requestorStepRef}
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={goBack}
                shouldShowOnfido={Boolean(shouldShowOnfido)}
                getDefaultStateForField={getDefaultStateForField}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT) {
        return (
            <ACHContractStep
                reimbursementAccount={reimbursementAccount}
                reimbursementAccountDraft={reimbursementAccountDraft}
                onBackButtonPress={goBack}
                companyName={achData.companyName}
                getDefaultStateForField={getDefaultStateForField}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION) {
        return (
            <ValidationStep
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={goBack}
                policyID={policyID}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE) {
        return (
            <EnableStep
                reimbursementAccount={reimbursementAccount}
                policyName={policyName}
                onBackButtonPress={goBack}
            />
        );
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;
ReimbursementAccountPage.displayName = 'ReimbursementAccountPage';

export default compose(
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
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
    withPolicy,
)(ReimbursementAccountPage);
