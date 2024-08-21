import type {RouteProp} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import lodashPick from 'lodash/pick';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import shouldReopenOnfido from '@libs/shouldReopenOnfido';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InputID} from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {ACHData, BankAccountStep as TBankAccountStep} from '@src/types/onyx/ReimbursementAccount';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ACHContractStep from './ACHContractStep';
import BankAccountStep from './BankAccountStep';
import BeneficialOwnersStep from './BeneficialOwnersStep';
import CompanyStep from './CompanyStep';
import ConnectBankAccount from './ConnectBankAccount/ConnectBankAccount';
import ContinueBankAccountSetup from './ContinueBankAccountSetup';
import EnableBankAccount from './EnableBankAccount/EnableBankAccount';
import RequestorStep from './RequestorStep';

type ReimbursementAccountOnyxProps = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: OnyxEntry<string>;

    /** Plaid SDK current event */
    plaidCurrentEvent: OnyxEntry<string>;

    /** Indicated whether the app is loading */
    isLoadingApp: OnyxEntry<boolean>;

    /** Holds information about the users account that is logging in */
    account: OnyxEntry<OnyxTypes.Account>;

    /** Current session for the user */
    session: OnyxEntry<OnyxTypes.Session>;

    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** The token required to initialize the Onfido SDK */
    onfidoToken: OnyxEntry<string>;
};

type ReimbursementAccountPageProps = WithPolicyOnyxProps &
    ReimbursementAccountOnyxProps &
    StackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>;

const ROUTE_NAMES = {
    COMPANY: 'company',
    PERSONAL_INFORMATION: 'personal-information',
    BENEFICIAL_OWNERS: 'beneficial-owners',
    CONTRACT: 'contract',
    VALIDATE: 'validate',
    ENABLE: 'enable',
    NEW: 'new',
};

/**
 * We can pass stepToOpen in the URL to force which step to show.
 * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
 */
function getStepToOpenFromRouteParams(route: RouteProp<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>): TBankAccountStep | '' {
    switch (route.params.stepToOpen) {
        case ROUTE_NAMES.NEW:
            return CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        case ROUTE_NAMES.COMPANY:
            return CONST.BANK_ACCOUNT.STEP.COMPANY;
        case ROUTE_NAMES.PERSONAL_INFORMATION:
            return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
        case ROUTE_NAMES.BENEFICIAL_OWNERS:
            return CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS;
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

function getRouteForCurrentStep(currentStep: TBankAccountStep): ValueOf<typeof ROUTE_NAMES> {
    switch (currentStep) {
        case CONST.BANK_ACCOUNT.STEP.COMPANY:
            return ROUTE_NAMES.COMPANY;
        case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
            return ROUTE_NAMES.PERSONAL_INFORMATION;
        case CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
            return ROUTE_NAMES.BENEFICIAL_OWNERS;
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

function ReimbursementAccountPage({
    reimbursementAccount,
    route,
    onfidoToken = '',
    policy,
    account,
    isLoadingApp = false,
    session,
    plaidLinkToken = '',
    plaidCurrentEvent = '',
}: ReimbursementAccountPageProps) {
    /**
        The SetupWithdrawalAccount flow allows us to continue the flow from various points depending on where the
        user left off. This view will refer to the achData as the single source of truth to determine which route to
        display. We can also specify a specific route to navigate to via route params when the component first
        mounts which will set the achData.currentStep after the account data is fetched and overwrite the logical
        next step.
    */
    const achData = reimbursementAccount?.achData;

    function getBankAccountFields<T extends InputID>(fieldNames: T[]): Pick<ACHData, T> {
        return {
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
        };
    }

    /**
     * Returns selected bank account fields based on field names provided.
     */
    function getFieldsForStep(step: TBankAccountStep): InputID[] {
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
     * Returns true if a VBBA exists in any state other than OPEN or LOCKED
     */
    function hasInProgressVBBA(): boolean {
        return !!achData?.bankAccountID && achData?.state !== BankAccount.STATE.OPEN && achData?.state !== BankAccount.STATE.LOCKED;
    }
    /*
     * Calculates the state used to show the "Continue with setup" view. If a bank account setup is already in progress and
     * no specific further step was passed in the url we'll show the workspace bank account reset modal if the user wishes to start over
     */
    function getShouldShowContinueSetupButtonInitialValue(): boolean {
        if (!hasInProgressVBBA()) {
            // Since there is no VBBA in progress, we won't need to show the component ContinueBankAccountSetup
            return false;
        }
        return achData?.state === BankAccount.STATE.PENDING || [CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, ''].includes(getStepToOpenFromRouteParams(route));
    }

    /**
        When this page is first opened, `reimbursementAccount` prop might not yet be fully loaded from Onyx.
        Calculating `shouldShowContinueSetupButton` immediately on initial render doesn't make sense as
        it relies on complete data. Thus, we should wait to calculate it until we have received
        the full `reimbursementAccount` data from the server. This logic is handled within the useEffect hook,
        which acts similarly to `componentDidUpdate` when the `reimbursementAccount` dependency changes.
     */
    const [hasACHDataBeenLoaded, setHasACHDataBeenLoaded] = useState(reimbursementAccount !== CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA);

    const [shouldShowContinueSetupButton, setShouldShowContinueSetupButton] = useState(hasACHDataBeenLoaded ? getShouldShowContinueSetupButtonInitialValue() : false);
    const [isReimbursementAccountLoading, setIsReimbursementAccountLoading] = useState(true);

    // eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing
    const currentStep = achData?.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    const policyName = policy?.name ?? '';
    const policyIDParam = route.params?.policyID ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const requestorStepRef = useRef(null);
    const prevIsReimbursementAccountLoading = usePrevious(reimbursementAccount?.isLoading);
    const prevReimbursementAccount = usePrevious(reimbursementAccount);
    const prevIsOffline = usePrevious(isOffline);

    /**
     * Retrieve verified business bank account currently being set up.
     * @param ignoreLocalCurrentStep Pass true if you want the last "updated" view (from db), not the last "viewed" view (from onyx).
     * @param ignoreLocalSubStep Pass true if you want the last "updated" view (from db), not the last "viewed" view (from onyx).
     */
    function fetchData(ignoreLocalCurrentStep?: boolean, ignoreLocalSubStep?: boolean) {
        // Show loader right away, as optimisticData might be set only later in case multiple calls are in the queue
        BankAccounts.setReimbursementAccountLoading(true);

        // We can specify a step to navigate to by using route params when the component mounts.
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = getStepToOpenFromRouteParams(route);
        const subStep = achData?.subStep ?? '';
        const localCurrentStep = achData?.currentStep ?? '';
        BankAccounts.openReimbursementAccountPage(stepToOpen, ignoreLocalSubStep ? '' : subStep, ignoreLocalCurrentStep ? '' : localCurrentStep, policyIDParam);
    }

    useEffect(() => {
        // If the step to open is empty, we want to clear the sub step, so the connect option view is shown to the user
        const isStepToOpenEmpty = getStepToOpenFromRouteParams(route) === '';
        if (isStepToOpenEmpty) {
            BankAccounts.setBankAccountSubStep(null);
            BankAccounts.setPlaidEvent(null);
        }
        fetchData(false, isStepToOpenEmpty);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []); // The empty dependency array ensures this runs only once after the component mounts.

    useEffect(() => {
        if (typeof reimbursementAccount?.isLoading !== 'boolean' || reimbursementAccount.isLoading === prevIsReimbursementAccountLoading) {
            return;
        }
        setIsReimbursementAccountLoading(reimbursementAccount.isLoading);
    }, [prevIsReimbursementAccountLoading, reimbursementAccount?.isLoading]);

    useEffect(
        () => {
            // Check for network change from offline to online
            if (prevIsOffline && !isOffline && prevReimbursementAccount && prevReimbursementAccount.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                fetchData();
            }

            if (!hasACHDataBeenLoaded) {
                if (reimbursementAccount !== CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA && isReimbursementAccountLoading === false) {
                    setShouldShowContinueSetupButton(getShouldShowContinueSetupButtonInitialValue());
                    setHasACHDataBeenLoaded(true);
                }
                return;
            }

            if (
                prevReimbursementAccount &&
                prevReimbursementAccount.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                reimbursementAccount?.pendingAction !== prevReimbursementAccount.pendingAction
            ) {
                setShouldShowContinueSetupButton(hasInProgressVBBA());
            }

            if (shouldShowContinueSetupButton) {
                return;
            }

            const currentStepRouteParam = getStepToOpenFromRouteParams(route);
            if (currentStepRouteParam === currentStep) {
                // If the user is connecting online with plaid, reset any bank account errors so we don't persist old data from a potential previous connection
                if (currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT && achData?.subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
                    BankAccounts.hideBankAccountErrors();
                }

                // The route is showing the correct step, no need to update the route param or clear errors.
                return;
            }

            // Update the data that is returned from back-end to draft value
            const draftStep = reimbursementAccount?.draftStep;
            if (draftStep) {
                BankAccounts.updateReimbursementAccountDraft(getBankAccountFields(getFieldsForStep(draftStep)));
            }

            if (currentStepRouteParam !== '') {
                // When we click "Connect bank account", we load the page without the current step param, if there
                // was an error when we tried to disconnect or start over, we want the user to be able to see the error,
                // so we don't clear it. We only want to clear the errors if we are moving between steps.
                BankAccounts.hideBankAccountErrors();
            }

            const policyID = route.params.policyID;
            const backTo = route.params.backTo;

            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(getRouteForCurrentStep(currentStep), policyID, backTo));
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [isOffline, reimbursementAccount, route, hasACHDataBeenLoaded, shouldShowContinueSetupButton],
    );

    const setManualStep = () => {
        BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL).then(() => {
            setShouldShowContinueSetupButton(false);
        });
        fetchData(true);
    };

    const goBack = () => {
        const subStep = achData?.subStep;
        const shouldShowOnfido = onfidoToken && !achData?.isOnfidoSetupComplete;

        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
                if (hasInProgressVBBA()) {
                    setShouldShowContinueSetupButton(true);
                }
                if (subStep) {
                    BankAccounts.setBankAccountSubStep(null);
                    BankAccounts.setPlaidEvent(null);
                } else {
                    Navigation.goBack();
                }
                break;

            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                BankAccounts.clearOnfidoToken();
                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                break;

            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                if (shouldShowOnfido) {
                    BankAccounts.clearOnfidoToken();
                } else {
                    BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
                }
                break;

            case CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                break;

            case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
                BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS);
                break;

            case CONST.BANK_ACCOUNT.STEP.VALIDATION:
                if ([BankAccount.STATE.VERIFYING, BankAccount.STATE.SETUP].some((value) => value === achData?.state)) {
                    BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT);
                } else if (!isOffline && achData?.state === BankAccount.STATE.PENDING) {
                    setShouldShowContinueSetupButton(true);
                } else {
                    Navigation.goBack();
                }
                break;

            default:
                Navigation.goBack();
        }
    };

    const isLoading = (!!isLoadingApp || !!account?.isLoading || isReimbursementAccountLoading) && (!plaidCurrentEvent || plaidCurrentEvent === CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.EXIT);

    const shouldShowOfflineLoader = !(
        isOffline &&
        [
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
            CONST.BANK_ACCOUNT.STEP.COMPANY,
            CONST.BANK_ACCOUNT.STEP.REQUESTOR,
            CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS,
            CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
        ].some((value) => value === currentStep)
    );

    // Show loading indicator when page is first time being opened and props.reimbursementAccount yet to be loaded from the server
    // or when data is being loaded. Don't show the loading indicator if we're offline and restarted the bank account setup process
    // On Android, when we open the app from the background, Onfido activity gets destroyed, so we need to reopen it.
    if ((!hasACHDataBeenLoaded || isLoading) && shouldShowOfflineLoader && (shouldReopenOnfido || !requestorStepRef.current)) {
        return <ReimbursementAccountLoadingIndicator onBackButtonPress={goBack} />;
    }

    if (!isLoading && (isEmptyObject(policy) || !PolicyUtils.isPolicyAdmin(policy))) {
        return (
            <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
                <FullPageNotFoundView
                    shouldShow
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                />
            </ScreenWrapper>
        );
    }

    let errorText;
    const userHasPhonePrimaryEmail = Str.endsWith(session?.email ?? '', CONST.SMS.DOMAIN);
    const throttledDate = reimbursementAccount?.throttledDate ?? '';
    const hasUnsupportedCurrency = (policy?.outputCurrency ?? '') !== CONST.CURRENCY.USD;

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
                    onBackButtonPress={() => Navigation.goBack()}
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
                onContinuePress={setManualStep}
                policyName={policyName}
                onBackButtonPress={Navigation.goBack}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT) {
        return (
            <BankAccountStep
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={goBack}
                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                plaidLinkOAuthToken={plaidLinkToken}
                policyName={policyName}
                policyID={policyIDParam}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY) {
        return <CompanyStep onBackButtonPress={goBack} />;
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
        const shouldShowOnfido = onfidoToken && !achData?.isOnfidoSetupComplete;
        return (
            <RequestorStep
                ref={requestorStepRef}
                shouldShowOnfido={!!shouldShowOnfido}
                onBackButtonPress={goBack}
            />
        );
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS) {
        return <BeneficialOwnersStep onBackButtonPress={goBack} />;
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT) {
        return <ACHContractStep onBackButtonPress={goBack} />;
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION) {
        return <ConnectBankAccount onBackButtonPress={goBack} />;
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE) {
        return (
            <EnableBankAccount
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={goBack}
            />
        );
    }
}

ReimbursementAccountPage.displayName = 'ReimbursementAccountPage';

export default withPolicy(
    withOnyx<ReimbursementAccountPageProps, ReimbursementAccountOnyxProps>({
        // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
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
    })(ReimbursementAccountPage),
);
