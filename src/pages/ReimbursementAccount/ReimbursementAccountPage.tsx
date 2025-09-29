import {useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import lodashPick from 'lodash/pick';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCurrencySupportedForECards} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getRouteForCurrentStep, hasInProgressUSDVBBA, hasInProgressVBBA} from '@libs/ReimbursementAccountUtils';
import shouldReopenOnfido from '@libs/shouldReopenOnfido';
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
import {isCurrencySupportedForGlobalReimbursement} from '@userActions/Policy/Policy';
import {clearReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
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

function ReimbursementAccountPage({route, policy, isLoadingPolicy, navigation}: ReimbursementAccountPageProps) {
    const {environmentURL} = useEnvironment();
    const session = useSession();
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [plaidCurrentEvent = ''] = useOnyx(ONYXKEYS.PLAID_CURRENT_EVENT, {canBeMissing: true});
    const [onfidoToken = ''] = useOnyx(ONYXKEYS.ONFIDO_TOKEN, {canBeMissing: true});
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);

    const {isBetaEnabled} = usePermissions();
    const policyName = policy?.name ?? '';
    const policyIDParam = route.params?.policyID;
    const backTo = route.params.backTo;
    const isComingFromExpensifyCard = (backTo as string)?.includes(CONST.EXPENSIFY_CARD.ROUTE as string);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const requestorStepRef = useRef<View>(null);
    const prevReimbursementAccount = usePrevious(reimbursementAccount);
    const prevIsOffline = usePrevious(isOffline);
    const policyCurrency = policy?.outputCurrency ?? '';
    const isNonUSDWorkspace = policyCurrency !== CONST.CURRENCY.USD;
    const hasUnsupportedCurrency =
        isComingFromExpensifyCard && isBetaEnabled(CONST.BETAS.EXPENSIFY_CARD_EU_UK) && isNonUSDWorkspace
            ? !isCurrencySupportedForECards(policyCurrency)
            : !isCurrencySupportedForGlobalReimbursement(policyCurrency as CurrencyType, isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND));
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
    const isPreviousPolicy = isLoadingOnyxValue(reimbursementAccountMetadata) ? true : policyIDParam === achData?.policyID;
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
    const [nonUSDBankAccountStep, setNonUSDBankAccountStep] = useState<string | null>(null);
    const [USDBankAccountStep, setUSDBankAccountStep] = useState<string | null>(null);

    function getBankAccountFields(fieldNames: InputID[]): Partial<ACHDataReimbursementAccount> {
        return {
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
        };
    }

    const shouldShowContinueSetupButtonValue = useMemo(() => {
        return hasInProgressVBBA(achData, isNonUSDWorkspace, nonUSDCountryDraftValue);
    }, [achData, isNonUSDWorkspace, nonUSDCountryDraftValue]);

    /**
     When this page is first opened, `reimbursementAccount` prop might not yet be fully loaded from Onyx.
     Calculating `shouldShowContinueSetupButton` immediately on initial render doesn't make sense as
     it relies on incomplete data. Thus, we should wait to calculate it until we have received
     the full `reimbursementAccount` data from the server. This logic is handled within the useEffect hook,
     which acts similarly to `componentDidUpdate` when the `reimbursementAccount` dependency changes.
     */
    const [hasACHDataBeenLoaded, setHasACHDataBeenLoaded] = useState(reimbursementAccount !== CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA && isPreviousPolicy);
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

        if (policyIDParam) {
            openReimbursementAccountPage(stepToOpen, subStep, localCurrentStep, policyIDParam);
        }
    }

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => {
        if (isPreviousPolicy) {
            return;
        }

        if (policyIDParam) {
            setReimbursementAccountLoading(true);
        }
        clearReimbursementAccountDraft();

        // If the step to open is empty, we want to clear the sub step, so the connect option view is shown to the user
        const isStepToOpenEmpty = getStepToOpenFromRouteParams(route, hasConfirmedUSDCurrency) === '';
        if (isStepToOpenEmpty) {
            setBankAccountSubStep(null);
            setPlaidEvent(null);
        }
        fetchData();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isPreviousPolicy]); // Only re-run this effect when isPreviousPolicy changes, which happens once when the component first loads

    useEffect(() => {
        if (!isPreviousPolicy) {
            return;
        }

        setShouldShowConnectedVerifiedBankAccount(isNonUSDWorkspace ? achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN : achData?.currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE);
        setShouldShowContinueSetupButton(shouldShowContinueSetupButtonValue);
    }, [achData?.currentStep, shouldShowContinueSetupButtonValue, isNonUSDWorkspace, isPreviousPolicy, achData?.state]);

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
            navigation.setParams({stepToOpen: getRouteForCurrentStep(currentStep)});
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
        const isPastSignerStep = achData?.corpay?.signerFullName && achData?.corpay?.authorizedToBindClientToAgreement === undefined;
        const allAgreementsChecked =
            reimbursementAccountDraft?.authorizedToBindClientToAgreement === true &&
            reimbursementAccountDraft?.agreeToTermsAndConditions === true &&
            reimbursementAccountDraft?.consentToPrivacyNotice === true &&
            reimbursementAccountDraft?.provideTruthfulInformation === true;

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

        if (achData?.corpay?.anyIndividualOwn25PercentOrMore !== undefined && achData?.corpay?.signerFullName === undefined) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO);
            return;
        }

        if (isPastSignerStep && !allAgreementsChecked) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
            return;
        }

        if (isPastSignerStep && allAgreementsChecked && !isDocusignStepRequired) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
            return;
        }

        if (isPastSignerStep && allAgreementsChecked && isDocusignStepRequired) {
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
                } else if (!isOffline && achData?.state === CONST.BANK_ACCOUNT.STATE.PENDING) {
                    setShouldShowContinueSetupButton(true);
                    setUSDBankAccountStep(null);
                } else {
                    Navigation.goBack();
                }
                break;

            default:
                Navigation.dismissModal();
        }
    }, [achData, currentStep, isOffline, onfidoToken]);

    const isLoading =
        (isLoadingApp || (reimbursementAccount?.isLoading && !reimbursementAccount?.isCreateCorpayBankAccount)) &&
        (!plaidCurrentEvent || plaidCurrentEvent === CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.EXIT);

    const shouldShowOfflineLoader = !(
        isOffline &&
        [
            CONST.BANK_ACCOUNT.STEP.COUNTRY,
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
            CONST.BANK_ACCOUNT.STEP.COMPANY,
            CONST.BANK_ACCOUNT.STEP.REQUESTOR,
            CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS,
            CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
        ].some((value) => value === currentStep)
    );

    if (isLoadingPolicy) {
        return <FullScreenLoadingIndicator />;
    }

    // Show loading indicator when page is first time being opened and props.reimbursementAccount yet to be loaded from the server
    // or when data is being loaded. Don't show the loading indicator if we're offline and restarted the bank account setup process
    // On Android, when we open the app from the background, Onfido activity gets destroyed, so we need to reopen it.
    // eslint-disable-next-line react-compiler/react-compiler
    if (
        (!hasACHDataBeenLoaded || isLoading) &&
        shouldShowOfflineLoader &&
        (shouldReopenOnfido || !requestorStepRef?.current) &&
        !(currentStep === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT && isValidateCodeActionModalVisible)
    ) {
        return <ReimbursementAccountLoadingIndicator onBackButtonPress={goBack} />;
    }

    if ((!isLoading && (isEmptyObject(policy) || !isPolicyAdmin(policy))) || isPendingDeletePolicy(policy)) {
        return (
            <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
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
        errorText = <RenderHTML html={translate('bankAccount.hasPhoneLoginError', {contactMethodRoute})} />;
    } else if (throttledDate) {
        errorText = <Text>{translate('bankAccount.hasBeenThrottledError')}</Text>;
    } else if (hasUnsupportedCurrency) {
        errorText = <RenderHTML html={translate('bankAccount.hasCurrencyError', {workspaceRoute})} />;
    }

    if (errorText) {
        return (
            <ScreenWrapper testID={ReimbursementAccountPage.displayName}>
                <HeaderWithBackButton
                    title={translate('bankAccount.addBankAccount')}
                    subtitle={policyName}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.m5, styles.mv3, styles.flex1]}>{errorText}</View>
            </ScreenWrapper>
        );
    }

    if (shouldShowConnectedVerifiedBankAccount) {
        return (
            <ConnectedVerifiedBankAccount
                reimbursementAccount={reimbursementAccount}
                setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
                setUSDBankAccountStep={setUSDBankAccountStep}
                setNonUSDBankAccountStep={setNonUSDBankAccountStep}
                onBackButtonPress={goBack}
                isNonUSDWorkspace={isNonUSDWorkspace}
            />
        );
    }

    if (isNonUSDWorkspace && nonUSDBankAccountStep !== null) {
        return (
            <NonUSDVerifiedBankAccountFlow
                nonUSDBankAccountStep={nonUSDBankAccountStep}
                setNonUSDBankAccountStep={setNonUSDBankAccountStep}
                setShouldShowContinueSetupButton={setShouldShowContinueSetupButton}
                policyID={policyIDParam}
                isComingFromExpensifyCard={isComingFromExpensifyCard}
                shouldShowContinueSetupButtonValue={shouldShowContinueSetupButtonValue}
                policyCurrency={policyCurrency}
            />
        );
    }

    if (USDBankAccountStep !== null) {
        return (
            <USDVerifiedBankAccountFlow
                USDBankAccountStep={currentStep}
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
            onContinuePress={isNonUSDWorkspace ? continueNonUSDVBBASetup : continueUSDVBBASetup}
            policyName={policyName}
            isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}
            toggleValidateCodeActionModal={setIsValidateCodeActionModalVisible}
            onBackButtonPress={Navigation.goBack}
            shouldShowContinueSetupButton={shouldShowContinueSetupButton}
            isNonUSDWorkspace={isNonUSDWorkspace}
            setNonUSDBankAccountStep={setNonUSDBankAccountStep}
            setUSDBankAccountStep={setUSDBankAccountStep}
            policyID={policyIDParam}
        />
    );
}

ReimbursementAccountPage.displayName = 'ReimbursementAccountPage';

export default withPolicy(ReimbursementAccountPage);
