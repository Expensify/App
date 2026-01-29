import {useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import lodashPick from 'lodash/pick';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCurrencySupportedForECards} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getRouteForCurrentStep, hasInProgressUSDVBBA, hasInProgressVBBA} from '@libs/ReimbursementAccountUtils';
import shouldReopenOnfido from '@libs/shouldReopenOnfido';
import {isFullScreenName} from '@navigation/helpers/isNavigatorName';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import {
    clearOnfidoToken,
    goToWithdrawalAccountSetupStep,
    hideBankAccountErrors,
    openReimbursementAccountPage,
    setBankAccountSubStep,
    setPlaidEvent,
    setReimbursementAccountLoading,
    updateReimbursementAccountDraft,
} from '@userActions/BankAccounts';
import {getPaymentMethods} from '@userActions/PaymentMethods';
import {isCurrencySupportedForGlobalReimbursement} from '@userActions/Policy/Policy';
import {clearReimbursementAccount, clearReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InputID} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ACHDataReimbursementAccount, ReimbursementAccountStep} from '@src/types/onyx/ReimbursementAccount';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ConnectedVerifiedBankAccount from './ConnectedVerifiedBankAccount';
import NonUSDVerifiedBankAccountFlow from './NonUSD/NonUSDVerifiedBankAccountFlow';
import requiresDocusignStep from './NonUSD/utils/requiresDocusignStep';
import USDVerifiedBankAccountFlow from './USD/USDVerifiedBankAccountFlow';
import getFieldsForStep from './USD/utils/getFieldsForStep';
import getStepToOpenFromRouteParams from './USD/utils/getStepToOpenFromRouteParams';
import VerifiedBankAccountFlowEntryPoint from './VerifiedBankAccountFlowEntryPoint';

type ReimbursementAccountPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

const OFFLINE_ACCESSIBLE_STEPS = [
    CONST.BANK_ACCOUNT.STEP.COUNTRY,
    CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
    CONST.BANK_ACCOUNT.STEP.COMPANY,
    CONST.BANK_ACCOUNT.STEP.REQUESTOR,
    CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS,
    CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
] as const;

function ReimbursementAccountPage({route, policy, isLoadingPolicy, navigation}: ReimbursementAccountPageProps) {
    const {environmentURL} = useEnvironment();
    const session = useSession();
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [plaidCurrentEvent = ''] = useOnyx(ONYXKEYS.PLAID_CURRENT_EVENT, {canBeMissing: true});
    const [onfidoToken = ''] = useOnyx(ONYXKEYS.ONFIDO_TOKEN, {canBeMissing: true});
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const topmostFullScreenRoute = useRootNavigationState((state) => state?.routes.findLast((lastRoute) => isFullScreenName(lastRoute.name)));

    const {isBetaEnabled} = usePermissions();
    const policyName = policy?.name ?? '';
    const policyIDParam = route.params?.policyID;
    const subStepParam = route.params?.subStep;
    const backTo = route.params.backTo;
    const isComingFromExpensifyCard = (backTo as string)?.includes(CONST.EXPENSIFY_CARD.ROUTE as string);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const requestorStepRef = useRef<View>(null);
    const prevReimbursementAccount = usePrevious(reimbursementAccount);
    const prevIsOffline = usePrevious(isOffline);
    const policyCurrency = policy ? policy.outputCurrency : reimbursementAccountDraft?.currency;
    const prevPolicyCurrency = usePrevious(policyCurrency);
    const achContractValuesRef = useRef<{
        isAuthorizedToUseBankAccount?: boolean;
        certifyTrueInformation?: boolean;
        acceptTermsAndConditions?: boolean;
    }>({});
    const isLoadingWorkspaceReimbursement = policy?.isLoadingWorkspaceReimbursement;
    const isNonUSDWorkspace = !!policyCurrency && policyCurrency !== CONST.CURRENCY.USD;
    const hasUnsupportedCurrency =
        isComingFromExpensifyCard && isBetaEnabled(CONST.BETAS.EXPENSIFY_CARD_EU_UK) && isNonUSDWorkspace
            ? !isCurrencySupportedForECards(policyCurrency)
            : !isCurrencySupportedForGlobalReimbursement(policyCurrency as CurrencyType);
    const nonUSDCountryDraftValue = reimbursementAccountDraft?.country ?? '';
    let workspaceRoute = '';
    const isFocused = useIsFocused();

    // Navigation.getActiveRoute() can return the route of previous page while this page is blurred
    // So add isFocused check to get the correct workspaceRoute
    if (isFocused) {
        workspaceRoute = `${environmentURL}/${ROUTES.WORKSPACE_OVERVIEW.getRoute(policyIDParam, Navigation.getActiveRoute())}`;
    }

    const contactMethodRoute = `${environmentURL}/${ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo)}`;
    const achData = reimbursementAccount?.achData;
    const isPreviousPolicy =
        !!reimbursementAccount && !isLoadingOnyxValue(reimbursementAccountMetadata) ? policyIDParam === achData?.policyID : isLoadingOnyxValue(reimbursementAccountMetadata);
    const hasConfirmedUSDCurrency = (reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '') !== '' || (achData?.accountNumber ?? '') !== '';
    const isDocusignStepRequired = requiresDocusignStep(policyCurrency);

    /**
     We main rely on `achData.currentStep` to determine the step to display in USD flow.
     This data is synchronized with the BE to know which step to resume/start from.
     Except for the CountryStep which exists purely in the FE.
     This function is to decide if we should start from the CountryStep.
     */
    const getInitialCurrentStep = () => {
        if (!hasConfirmedUSDCurrency) {
            return CONST.BANK_ACCOUNT.STEP.COUNTRY;
        }

        return achData?.currentStep ?? CONST.BANK_ACCOUNT.STEP.COUNTRY;
    };
    const currentStep = getInitialCurrentStep();
    const [nonUSDBankAccountStep, setNonUSDBankAccountStep] = useState<string | null>(subStepParam ?? null);
    const [USDBankAccountStep, setUSDBankAccountStep] = useState<string | null>(subStepParam ?? null);
    const [isResettingBankAccount, setIsResettingBankAccount] = useState(false);
    const [isNonUSDSetup, setIsNonUSDSetup] = useState(policy ? isNonUSDWorkspace : achData?.currency !== CONST.CURRENCY.USD || reimbursementAccountDraft?.currency !== CONST.CURRENCY.USD);

    useEffect(() => {
        return () => {
            // we want to clear reimbursementAccount and reimbursementAccountDraft when the setup is initiated from the Wallet
            if (backTo === ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE || backTo === ROUTES.SETTINGS_WALLET) {
                clearReimbursementAccountDraft();
                clearReimbursementAccount();
                return;
            }
            getPaymentMethods(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!policyCurrency || isNonUSDSetup === (policyCurrency !== CONST.CURRENCY.USD)) {
            return;
        }
        setIsNonUSDSetup(policyCurrency !== CONST.CURRENCY.USD);
    }, [policyCurrency, isNonUSDSetup]);

    useEffect(() => {
        const achContractValues = lodashPick(reimbursementAccountDraft, ['isAuthorizedToUseBankAccount', 'certifyTrueInformation', 'acceptTermsAndConditions']);

        if (!isEmptyObject(achContractValues)) {
            achContractValuesRef.current = achContractValues;
        }
    }, [reimbursementAccountDraft]);

    useEffect(() => {
        if (reimbursementAccountDraft || isEmptyObject(achContractValuesRef.current) || currentStep !== CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT) {
            return;
        }

        updateReimbursementAccountDraft(achContractValuesRef.current);
    }, [reimbursementAccountDraft, currentStep]);

    function getBankAccountFields(fieldNames: InputID[]): Partial<ACHDataReimbursementAccount> {
        return {
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
        };
    }

    const shouldShowContinueSetupButtonValue = useMemo(() => {
        return hasInProgressVBBA(achData, isNonUSDSetup);
    }, [achData, isNonUSDSetup]);
    /**
     When this page is first opened, `reimbursementAccount` prop might not yet be fully loaded from Onyx.
     Calculating `shouldShowContinueSetupButton` immediately on initial render doesn't make sense as
     it relies on incomplete data. Thus, we should wait to calculate it until we have received
     the full `reimbursementAccount` data from the server. This logic is handled within the useEffect hook,
     which acts similarly to `componentDidUpdate` when the `reimbursementAccount` dependency changes.
     */
    const [hasACHDataBeenLoaded, setHasACHDataBeenLoaded] = useState(reimbursementAccount !== CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA);
    const [shouldShowContinueSetupButton, setShouldShowContinueSetupButton] = useState<boolean>(shouldShowContinueSetupButtonValue);
    const [shouldShowConnectedVerifiedBankAccount, setShouldShowConnectedVerifiedBankAccount] = useState<boolean>(false);

    /**
     * Retrieve verified business bank account currently being set up.
     */
    function fetchData(preserveCurrentStep = false) {
        // We can specify a step to navigate to by using route params when the component mounts.
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = preserveCurrentStep ? currentStep : getStepToOpenFromRouteParams(route, hasConfirmedUSDCurrency);
        const subStep = isPreviousPolicy ? (achData?.subStep ?? '') : '';

        let localCurrentStep: ReimbursementAccountStep = '';
        if (preserveCurrentStep) {
            localCurrentStep = currentStep;
        } else if (isPreviousPolicy) {
            localCurrentStep = achData?.currentStep ?? '';
        }

        openReimbursementAccountPage(stepToOpen, subStep, localCurrentStep, policyIDParam);
    }

    useEffect(() => {
        if (isPreviousPolicy && !!reimbursementAccount) {
            return;
        }

        if (policyIDParam) {
            setReimbursementAccountLoading(true);
            clearReimbursementAccountDraft();
        }

        // If the step to open is empty, we want to clear the sub step, so the connect option view is shown to the user
        const isStepToOpenEmpty = getStepToOpenFromRouteParams(route, hasConfirmedUSDCurrency) === '';
        if (isStepToOpenEmpty) {
            setBankAccountSubStep(null);
            setPlaidEvent(null);
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPreviousPolicy]); // Only re-run this effect when isPreviousPolicy changes, which happens once when the component first loads

    useEffect(() => {
        if (policyIDParam && !isPreviousPolicy) {
            return;
        }

        // If USD bank account is in pending state, we should navigate straight to the validation step and skip Continue step
        if (policyCurrency === CONST.CURRENCY.USD && achData?.state === CONST.BANK_ACCOUNT.STATE.PENDING) {
            setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.VALIDATION);
            return;
        }

        // Sync USDBankAccountStep state with achData.currentStep when backend data changes.
        // This keeps state updated for legitimate step transitions while preventing flicker during transient re-renders.
        if (!isNonUSDSetup && USDBankAccountStep !== null && achData?.currentStep && achData.currentStep !== USDBankAccountStep) {
            setUSDBankAccountStep(achData.currentStep);
        }

        setShouldShowConnectedVerifiedBankAccount(isNonUSDSetup ? achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN : achData?.currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE);
        setShouldShowContinueSetupButton(shouldShowContinueSetupButtonValue);
    }, [policyIDParam, achData?.currentStep, shouldShowContinueSetupButtonValue, isNonUSDSetup, isPreviousPolicy, achData?.state, policyCurrency, USDBankAccountStep]);

    useEffect(() => {
        if (!prevPolicyCurrency || policyCurrency === prevPolicyCurrency) {
            return;
        }

        if (policyCurrency && policyCurrency === CONST.CURRENCY.USD) {
            setNonUSDBankAccountStep(null);
        } else {
            setUSDBankAccountStep(null);
        }
        setBankAccountSubStep(null);
    }, [policyCurrency, prevPolicyCurrency]);

    useEffect(
        () => {
            // Check for network change from offline to online
            if (prevIsOffline && !isOffline && prevReimbursementAccount && prevReimbursementAccount.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                fetchData(true);
            }

            if (!hasACHDataBeenLoaded) {
                if (reimbursementAccount !== CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA && reimbursementAccount?.isLoading === false) {
                    setHasACHDataBeenLoaded(true);
                }
                return;
            }

            if (
                prevReimbursementAccount &&
                prevReimbursementAccount.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                reimbursementAccount?.pendingAction !== prevReimbursementAccount.pendingAction
            ) {
                setShouldShowContinueSetupButton(hasInProgressUSDVBBA(achData));
            }

            if (shouldShowContinueSetupButton) {
                return;
            }

            const currentStepRouteParam = getStepToOpenFromRouteParams(route, hasConfirmedUSDCurrency);
            if (currentStepRouteParam === currentStep) {
                // If the user is connecting online with plaid, reset any bank account errors so we don't persist old data from a potential previous connection
                if (currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT && achData?.subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
                    hideBankAccountErrors();
                }

                // The route is showing the correct step, no need to update the route param or clear errors.
                return;
            }

            // Update the data that is returned from back-end to draft value
            const draftStep = reimbursementAccount?.draftStep;
            if (draftStep) {
                updateReimbursementAccountDraft(getBankAccountFields(getFieldsForStep(draftStep)));
            }

            if (currentStepRouteParam !== '') {
                // When we click "Connect bank account", we load the page without the current step param, if there
                // was an error when we tried to disconnect or start over, we want the user to be able to see the error,
                // so we don't clear it. We only want to clear the errors if we are moving between steps.
                hideBankAccountErrors();
            }

            // Use the current page navigation object to set the param to the correct route in the stack
            const stepToOpen = getRouteForCurrentStep(currentStep);
            navigation.setParams({stepToOpen});
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isOffline, reimbursementAccount, hasACHDataBeenLoaded, shouldShowContinueSetupButton, currentStep],
    );

    const continueUSDVBBASetup = useCallback(() => {
        // If user comes back to the flow we never want to allow him to go through plaid again
        // so we're always showing manual setup with locked numbers he can not change
        setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL).then(() => {
            setShouldShowContinueSetupButton(false);
            setUSDBankAccountStep(currentStep);
        });
    }, [currentStep]);

    const continueNonUSDVBBASetup = () => {
        const isPastSignerStep = () => {
            if (achData?.state === CONST.NON_USD_BANK_ACCOUNT.STATE.VERIFYING) {
                return true;
            }

            if (policyCurrency === CONST.CURRENCY.AUD) {
                return achData?.corpay?.signerFullName && achData?.corpay?.secondSignerFullName && achData?.corpay?.authorizedToBindClientToAgreement === undefined;
            }

            return achData?.corpay?.signerFullName && achData?.corpay?.authorizedToBindClientToAgreement === undefined;
        };
        const allAgreementsChecked =
            !!(reimbursementAccountDraft?.authorizedToBindClientToAgreement ?? achData?.corpay?.authorizedToBindClientToAgreement) &&
            !!(reimbursementAccountDraft?.agreeToTermsAndConditions ?? achData?.corpay?.agreeToTermsAndConditions) &&
            !!(reimbursementAccountDraft?.consentToPrivacyNotice ?? achData?.corpay?.consentToPrivacyNotice) &&
            !!(reimbursementAccountDraft?.provideTruthfulInformation ?? achData?.corpay?.provideTruthfulInformation);

        setShouldShowContinueSetupButton(false);
        if (nonUSDCountryDraftValue !== '' && achData?.created === undefined) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO);
            return;
        }

        if (achData?.created && achData?.corpay?.companyName === undefined) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO);
            return;
        }

        if (achData?.corpay?.companyName && achData?.corpay?.anyIndividualOwn25PercentOrMore === undefined) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO);
            return;
        }

        if (!isPastSignerStep()) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO);
            return;
        }

        if (isPastSignerStep() && !allAgreementsChecked) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
            return;
        }

        if (isPastSignerStep() && allAgreementsChecked && !isDocusignStepRequired && achData?.state !== CONST.BANK_ACCOUNT.STATE.VERIFYING) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
            return;
        }

        if (isPastSignerStep() && allAgreementsChecked && isDocusignStepRequired && achData?.state !== CONST.BANK_ACCOUNT.STATE.VERIFYING) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.DOCUSIGN);
            return;
        }

        if (achData?.state === CONST.BANK_ACCOUNT.STATE.VERIFYING) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH);
        }
    };

    const goBack = useCallback(() => {
        const shouldShowOnfido = onfidoToken && !achData?.isOnfidoSetupComplete;

        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.COUNTRY:
                if (hasInProgressUSDVBBA(achData)) {
                    setShouldShowContinueSetupButton(true);
                }
                setUSDBankAccountStep(null);
                setBankAccountSubStep(null);
                break;
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
                setPlaidEvent(null);
                goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COUNTRY);
                break;
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                clearOnfidoToken();
                goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                break;

            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                if (shouldShowOnfido) {
                    clearOnfidoToken();
                } else {
                    goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
                }
                break;

            case CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
                goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
                break;

            case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
                goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS);
                break;

            case CONST.BANK_ACCOUNT.STEP.VALIDATION:
                if ([CONST.BANK_ACCOUNT.STATE.VERIFYING, CONST.BANK_ACCOUNT.STATE.SETUP].some((value) => value === achData?.state)) {
                    goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT);
                } else {
                    Navigation.goBack();
                }
                break;

            default:
                Navigation.dismissModal();
        }
    }, [achData, currentStep, onfidoToken]);

    const isLoading =
        (isLoadingApp || (reimbursementAccount?.isLoading && !reimbursementAccount?.isCreateCorpayBankAccount)) &&
        (!plaidCurrentEvent || plaidCurrentEvent === CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.EXIT);

    const shouldShowOfflineLoader = !(isOffline && OFFLINE_ACCESSIBLE_STEPS.some((value) => value === currentStep));

    const shouldShowPolicyName = topmostFullScreenRoute?.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;
    const policyNameToDisplay = shouldShowPolicyName ? policyName : '';

    if (isLoadingPolicy) {
        return <FullScreenLoadingIndicator />;
    }

    // Show loading indicator when page is first time being opened and props.reimbursementAccount yet to be loaded from the server
    // or when data is being loaded. Don't show the loading indicator if we're offline and restarted the bank account setup process
    // On Android, when we open the app from the background, Onfido activity gets destroyed, so we need to reopen it.
    if ((!hasACHDataBeenLoaded || isLoading || isLoadingWorkspaceReimbursement) && shouldShowOfflineLoader && (shouldReopenOnfido || !requestorStepRef?.current)) {
        return <ReimbursementAccountLoadingIndicator onBackButtonPress={goBack} />;
    }

    if (!!policyIDParam && ((!isLoading && (isEmptyObject(policy) || !isPolicyAdmin(policy))) || isPendingDeletePolicy(policy))) {
        return (
            <ScreenWrapper testID="ReimbursementAccountPage">
                <FullPageNotFoundView
                    shouldShow
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    subtitleKey={isEmptyObject(policy) || isPendingDeletePolicy(policy) ? undefined : 'workspace.common.notAuthorized'}
                />
            </ScreenWrapper>
        );
    }

    let errorText;
    const userHasPhonePrimaryEmail = Str.endsWith(session?.email ?? '', CONST.SMS.DOMAIN);
    const throttledDate = reimbursementAccount?.throttledDate ?? '';

    if (userHasPhonePrimaryEmail) {
        errorText = <RenderHTML html={translate('bankAccount.hasPhoneLoginError', contactMethodRoute)} />;
    } else if (throttledDate) {
        errorText = <Text>{translate('bankAccount.hasBeenThrottledError')}</Text>;
    } else if (hasUnsupportedCurrency) {
        errorText = <RenderHTML html={translate('bankAccount.hasCurrencyError', {workspaceRoute})} />;
    }

    if (errorText) {
        return (
            <ScreenWrapper testID="ReimbursementAccountPage">
                <HeaderWithBackButton
                    title={translate('bankAccount.addBankAccount')}
                    subtitle={policyNameToDisplay}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.m5, styles.mv3, styles.flex1]}>{errorText}</View>
            </ScreenWrapper>
        );
    }

    if (shouldShowConnectedVerifiedBankAccount) {
        if (topmostFullScreenRoute?.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR) {
            return (
                <ScreenWrapper testID="ReimbursementAccountPage">
                    <HeaderWithBackButton
                        title={translate('bankAccount.addBankAccount')}
                        onBackButtonPress={() => Navigation.dismissModal()}
                    />
                    <ConfirmationPage
                        heading={translate('bankAccount.bbaAdded')}
                        description={translate('bankAccount.bbaAddedDescription')}
                        shouldShowButton
                        headingStyle={styles.mh5}
                        buttonText={translate('common.confirm')}
                        onButtonPress={() => Navigation.dismissModal()}
                    />
                </ScreenWrapper>
            );
        }
        return (
            <ConnectedVerifiedBankAccount
                reimbursementAccount={reimbursementAccount}
                setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
                setUSDBankAccountStep={setUSDBankAccountStep}
                setNonUSDBankAccountStep={setNonUSDBankAccountStep}
                onBackButtonPress={goBack}
                isNonUSDWorkspace={isNonUSDSetup}
            />
        );
    }

    if (isNonUSDSetup && nonUSDBankAccountStep !== null && !isResettingBankAccount) {
        return (
            <NonUSDVerifiedBankAccountFlow
                nonUSDBankAccountStep={nonUSDBankAccountStep}
                setNonUSDBankAccountStep={setNonUSDBankAccountStep}
                setShouldShowContinueSetupButton={setShouldShowContinueSetupButton}
                policyID={policyIDParam}
                isComingFromExpensifyCard={isComingFromExpensifyCard}
                shouldShowContinueSetupButtonValue={shouldShowContinueSetupButtonValue}
                policyCurrency={policyCurrency ?? ''}
            />
        );
    }

    if (!isNonUSDSetup && USDBankAccountStep !== null) {
        return (
            <USDVerifiedBankAccountFlow
                USDBankAccountStep={USDBankAccountStep}
                policyID={policyIDParam}
                onBackButtonPress={goBack}
                requestorStepRef={requestorStepRef}
                onfidoToken={onfidoToken}
                setUSDBankAccountStep={setUSDBankAccountStep}
                setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
            />
        );
    }

    return (
        <VerifiedBankAccountFlowEntryPoint
            setShouldShowContinueSetupButton={setShouldShowContinueSetupButton}
            reimbursementAccount={reimbursementAccount}
            onContinuePress={isNonUSDSetup ? continueNonUSDVBBASetup : continueUSDVBBASetup}
            policyName={policyName}
            backTo={backTo}
            shouldShowContinueSetupButton={shouldShowContinueSetupButton}
            isNonUSDWorkspace={isNonUSDSetup}
            setNonUSDBankAccountStep={setNonUSDBankAccountStep}
            setUSDBankAccountStep={setUSDBankAccountStep}
            policyID={policyIDParam}
            setIsResettingBankAccount={setIsResettingBankAccount}
        />
    );
}

export default withPolicy(ReimbursementAccountPage);
