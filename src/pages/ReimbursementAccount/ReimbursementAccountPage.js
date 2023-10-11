import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useRef, useEffect} from 'react';
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
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import withPolicy from '../workspace/withPolicy';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import * as PolicyUtils from '../../libs/PolicyUtils';
import shouldReopenOnfido from '../../libs/shouldReopenOnfido';
import useLocalize from '../../hooks/useLocalize';

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

function ReimbursementAccountPage({
    reimbursementAccount,
    network,
    route,
    onfidoToken,
    policy,
    account,
    isLoadingReportData,
    session,
    plaidLinkToken,
    reimbursementAccountDraft,

}) {
    const [prevProps, setPrevProps] = useState({
        current: {
            reimbursementAccount,
            network,
            route,
            onfidoToken,
            policy,
            account,
            isLoadingReportData,
            session,
            plaidLinkToken,
            reimbursementAccountDraft,
        }
    });
    const [shouldShowContinueSetupButton, setShouldShowContinueSetupButton] = useState(
        hasACHDataBeenLoaded ? getShouldShowContinueSetupButtonInitialValue() : false
    );
    const [hasACHDataBeenLoaded, setHasACHDataBeenLoaded] = useState(reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps);

    const achData = lodashGet(reimbursementAccount, 'achData', {});
    const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    const policyName = lodashGet(policy, 'name');
    const policyID = lodashGet(route.params, 'policyID');
    const {translate} = useLocalize();

    const continueFunction = () => {
        setShouldShowContinueSetupButton(false);
        fetchData(true);
    };

    useEffect(() => {
        // If it's a subsequent render, compare the current props with prevProps if needed.
        // At the end of the useEffect, update the prevProps to the current props for the next render cycle.
        setPrevProps({
            current: {
                reimbursementAccount,
                network,
                route,
                onfidoToken,
                policy,
                account,
                isLoadingReportData,
                session,
                plaidLinkToken,
                reimbursementAccountDraft,
            }
        });
    }, [
        reimbursementAccount,
        network,
        route,
        onfidoToken,
        policy,
        account,
        isLoadingReportData,
        session,
        plaidLinkToken,
        reimbursementAccountDraft,
    ]);

    /**
    * @param {String} fieldName
    * @param {*} defaultValue
    *
    * @returns {*}
    */
    const getDefaultStateForField = (fieldName, defaultValue = '') => {
        return lodashGet(reimbursementAccount, ['achData', fieldName], defaultValue);
    };

    const goBack = () => {
        const achData = lodashGet(reimbursementAccount, 'achData', {});
        const currentStep = achData.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
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
                } else {
                    Navigation.goBack(backTo);
                }
                break;
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, { subStep: CONST.BANK_ACCOUNT.SUBSTEP.MANUAL });
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
                } else if (!network.isOffline && achData.state === BankAccount.STATE.PENDING) {
                    setShouldShowContinueSetupButton(true);
                } else {
                    Navigation.goBack(backTo);
                }
                break;
            default:
                Navigation.goBack(backTo);
        }
    };

    /**
     * Returns true if a VBBA exists in any state other than OPEN or LOCKED
     * @returns {Boolean}
     */
    const hasInProgressVBBA = () => {
        const achData = lodashGet(reimbursementAccount, 'achData', {});
        return achData.bankAccountID
            && achData.state !== BankAccount.STATE.OPEN
            && achData.state !== BankAccount.STATE.LOCKED;
    };

    const requestorStepRef = useRef(null);

    // Will run whenever reimbursementAccount prop changes, and update the hasACHDataBeenLoaded state if necessary
    useEffect(() => {
        setHasACHDataBeenLoaded(reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps);
    }, [reimbursementAccount]);

    /*
     * Calculates the state used to show the "Continue with setup" view. If a bank account setup is already in progress and
     * no specific further step was passed in the url we'll show the workspace bank account reset modal if the user wishes to start over
     */
    const getShouldShowContinueSetupButtonInitialValue = () => {
        if (!hasInProgressVBBA()) {
            // Since there is no VBBA in progress, we won't need to show the component ContinueBankAccountSetup
            return false;
        }
        const achData = lodashGet(reimbursementAccount, 'achData', {});
        return achData.state === BankAccount.STATE.PENDING || _.contains([CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, ''], getStepToOpenFromRouteParams());
    }

    /**
     * We can pass stepToOpen in the URL to force which step to show.
     * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
     * @returns {String}
     */
    const getStepToOpenFromRouteParams = () => {
        switch (lodashGet(route, ['params', 'stepToOpen'], '')) {
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

    useEffect(() => {
        fetchData();
    }, []); // The empty dependency array ensures this runs only once after the component mounts.

    /**
     * Retrieve verified business bank account currently being set up.
     * @param {boolean} ignoreLocalCurrentStep Pass true if you want the last "updated" view (from db), not the last "viewed" view (from onyx).
     */
    const fetchData = (ignoreLocalCurrentStep) => {
        // Show loader right away, as optimisticData might be set only later in case multiple calls are in the queue
        BankAccounts.setReimbursementAccountLoading(true);

        // We can specify a step to navigate to by using route params when the component mounts.
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = getStepToOpenFromRouteParams();
        const achData = lodashGet(reimbursementAccount, 'achData', {});
        const subStep = achData.subStep || '';
        const localCurrentStep = achData.currentStep || '';
        BankAccounts.openReimbursementAccountPage(stepToOpen, subStep, ignoreLocalCurrentStep ? '' : localCurrentStep);
    };

    useEffect(() => {
        // Check for network change from offline to online
        if (prevProps.current.network.isOffline && !network.isOffline && prevProps.current.reimbursementAccount.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            fetchData();
        }

        if (!hasACHDataBeenLoaded) {
            if (reimbursementAccount !== ReimbursementAccountProps.reimbursementAccountDefaultProps && !reimbursementAccount.isLoading) {
                setShouldShowContinueSetupButton(getShouldShowContinueSetupButtonInitialValue());
                setHasACHDataBeenLoaded(true);
            }
            return;
        }

        if (
            prevProps.current.reimbursementAccount.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            reimbursementAccount.pendingAction !== prevProps.current.reimbursementAccount.pendingAction
        ) {
            setShouldShowContinueSetupButton(hasInProgressVBBA());
        }

        const currentStep = lodashGet(reimbursementAccount, 'achData.currentStep') || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;

        if (shouldShowContinueSetupButton) {
            return;
        }

        const currentStepRouteParam = getStepToOpenFromRouteParams();
        if (currentStepRouteParam === currentStep) {
            return;
        }
        if (currentStepRouteParam !== '') {
            BankAccounts.hideBankAccountErrors();
        }

        const backTo = lodashGet(route.params, 'backTo');
        const policyId = lodashGet(route.params, 'policyID');
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(getRouteForCurrentStep(currentStep), policyId, backTo));

        // At the end, update the prevProps ref to the current values
        prevProps.current = {
            reimbursementAccount,
            network,
            route,
            onfidoToken,
            policy,
            account,
            isLoadingReportData,
            session,
            plaidLinkToken,
            reimbursementAccountDraft,
        };
    }, [reimbursementAccount, network, route, hasACHDataBeenLoaded, shouldShowContinueSetupButton]);

    /**
     * @param {String} currentStep
     * @returns {String}
     */
    function getRouteForCurrentStep(currentStep) {
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

    // Rendering

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

    const isLoading = isLoadingReportData || account.isLoading || reimbursementAccount.isLoading;
    const shouldShowOfflineLoader = !(
        network.isOffline &&
        _.contains([
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
            CONST.BANK_ACCOUNT.STEP.COMPANY,
            CONST.BANK_ACCOUNT.STEP.REQUESTOR,
            CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT], currentStep)
    );

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
    const throttledDate = lodashGet(reimbursementAccount, 'throttledDate');
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
                <View style={[styles.m5, styles.flex1]}>
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
                reimbursementAccountDraft={reimbursementAccountDraft}
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
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE) {
        return (
            <EnableStep
                reimbursementAccount={reimbursementAccount}
                policyName={policyName}
            />
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
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
    withLocalize,
    withPolicy,
)(ReimbursementAccountPage);
