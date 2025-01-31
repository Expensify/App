import {Str} from 'expensify-common';
import lodashPick from 'lodash/pick';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxProvider';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getRouteForCurrentStep} from '@libs/ReimbursementAccountUtils';
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
import {clearReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {InputID} from '@src/types/form/ReimbursementAccountForm';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ContinueBankAccountSetup from './ContinueBankAccountSetup';
import NonUSDVerifiedBankAccountFlow from './NonUSD/NonUSDVerifiedBankAccountFlow';
import USDVerifiedBankAccountFlow from './USD/USDVerifiedBankAccountFlow';
import getFieldsForStep from './USD/utils/getFieldsForStep';
import getStepToOpenFromRouteParams from './USD/utils/getStepToOpenFromRouteParams';

type ReimbursementAccountPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>;

const SUPPORTED_FOREIGN_CURRENCIES: string[] = [CONST.CURRENCY.EUR, CONST.CURRENCY.GBP, CONST.CURRENCY.CAD, CONST.CURRENCY.AUD];

function ReimbursementAccountPage({route, policy, isLoadingPolicy}: ReimbursementAccountPageProps) {
    const session = useSession();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [plaidCurrentEvent = ''] = useOnyx(ONYXKEYS.PLAID_CURRENT_EVENT);
    const [onfidoToken = ''] = useOnyx(ONYXKEYS.ONFIDO_TOKEN);
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);

    const policyName = policy?.name ?? '';
    const policyIDParam = route.params?.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const requestorStepRef = useRef(null);
    const prevReimbursementAccount = usePrevious(reimbursementAccount);
    const prevIsOffline = usePrevious(isOffline);
    const policyCurrency = policy?.outputCurrency ?? '';
    const hasUnsupportedCurrency = policyCurrency !== CONST.CURRENCY.USD && !SUPPORTED_FOREIGN_CURRENCIES.includes(policyCurrency);
    const hasForeignCurrency = SUPPORTED_FOREIGN_CURRENCIES.includes(policyCurrency);

    /**
     The SetupWithdrawalAccount flow allows us to continue the flow from various points depending on where the
     user left off. This view will refer to the achData as the single source of truth to determine which route to
     display. We can also specify a specific route to navigate to via route params when the component first
     mounts which will set the achData.currentStep after the account data is fetched and overwrite the logical
     next step.
     */
    const achData = reimbursementAccount?.achData;
    const isPreviousPolicy = policyIDParam === achData?.policyID;
    // eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing
    const currentStep = !isPreviousPolicy ? CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT : achData?.currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    const [nonUSDBankAccountStep, setNonUSDBankAccountStep] = useState<string>(CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);

    function getBankAccountFields(fieldNames: InputID[]): Partial<ACHDataReimbursementAccount> {
        return {
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
        };
    }

    /**
     * Returns true if a VBBA exists in any state other than OPEN or LOCKED
     */
    function hasInProgressVBBA(): boolean {
        return !!achData?.bankAccountID && !!achData?.state && achData?.state !== BankAccount.STATE.OPEN && achData?.state !== BankAccount.STATE.LOCKED;
    }

    /** Returns true if user passed first step of flow for non USD VBBA */
    function hasInProgressNonUSDVBBA(): boolean {
        return !!achData?.bankAccountID && !!achData?.created;
    }

    /**
     * Calculates the state used to show the "Continue with setup" view.
     * for non USD workspace we check if first big step was passed
     * for USD workspace, if a bank account setup is already in progress and no specific further step was passed in the url
     * we'll show the workspace bank account reset modal if the user wishes to start over
     */
    const getShouldShowContinueSetupButtonInitialValue = useCallback(() => {
        if (hasForeignCurrency) {
            return hasInProgressNonUSDVBBA();
        }

        return hasInProgressVBBA();
    }, [hasForeignCurrency, hasInProgressNonUSDVBBA, hasInProgressVBBA]);

    /**
     When this page is first opened, `reimbursementAccount` prop might not yet be fully loaded from Onyx.
     Calculating `shouldShowContinueSetupButton` immediately on initial render doesn't make sense as
     it relies on incomplete data. Thus, we should wait to calculate it until we have received
     the full `reimbursementAccount` data from the server. This logic is handled within the useEffect hook,
     which acts similarly to `componentDidUpdate` when the `reimbursementAccount` dependency changes.
     */
    const [hasACHDataBeenLoaded, setHasACHDataBeenLoaded] = useState(reimbursementAccount !== CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA && isPreviousPolicy);
    const [shouldShowContinueSetupButton, setShouldShowContinueSetupButton] = useState<boolean | null>(null);

    /**
     * Retrieve verified business bank account currently being set up.
     */
    function fetchData() {
        // We can specify a step to navigate to by using route params when the component mounts.
        // We want to use the same stepToOpen variable when the network state changes because we can be redirected to a different step when the account refreshes.
        const stepToOpen = getStepToOpenFromRouteParams(route);
        const subStep = isPreviousPolicy ? achData?.subStep ?? '' : '';
        const localCurrentStep = isPreviousPolicy ? achData?.currentStep ?? '' : '';

        if (policyIDParam) {
            openReimbursementAccountPage(stepToOpen, subStep, localCurrentStep, policyIDParam);
        }
    }

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => {
        if (isPreviousPolicy) {
            return;
        }

        setReimbursementAccountLoading(true);
        clearReimbursementAccountDraft();

        // If the step to open is empty, we want to clear the sub step, so the connect option view is shown to the user
        const isStepToOpenEmpty = getStepToOpenFromRouteParams(route) === '';
        if (isStepToOpenEmpty) {
            setBankAccountSubStep(null);
            setPlaidEvent(null);
        }
        fetchData();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []); // The empty dependency array ensures this runs only once after the component mounts.

    useEffect(
        () => {
            // Check for network change from offline to online
            if (prevIsOffline && !isOffline && prevReimbursementAccount && prevReimbursementAccount.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                fetchData();
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
                setShouldShowContinueSetupButton(hasInProgressVBBA());
            }

            if (shouldShowContinueSetupButton) {
                return;
            }

            const currentStepRouteParam = getStepToOpenFromRouteParams(route);
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

            Navigation.setParams({stepToOpen: getRouteForCurrentStep(currentStep)});
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [isOffline, reimbursementAccount, route, hasACHDataBeenLoaded, shouldShowContinueSetupButton],
    );

    useEffect(() => {
        if (!hasACHDataBeenLoaded) {
            return;
        }

        setShouldShowContinueSetupButton(getShouldShowContinueSetupButtonInitialValue());
    }, [getShouldShowContinueSetupButtonInitialValue, hasACHDataBeenLoaded]);

    const continueUSDVBBASetup = () => {
        setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL).then(() => {
            setShouldShowContinueSetupButton(false);
        });
    };

    const continueNonUSDVBBASetup = () => {
        setShouldShowContinueSetupButton(false);
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

        if (achData?.corpay?.signerFullName && achData?.corpay?.authorizedToBindClientToAgreement === undefined) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
        }
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
                    setBankAccountSubStep(null);
                    setPlaidEvent(null);
                } else {
                    Navigation.goBack();
                }
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
                if ([BankAccount.STATE.VERIFYING, BankAccount.STATE.SETUP].some((value) => value === achData?.state)) {
                    goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT);
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

    const isLoading =
        (isLoadingApp || !!account?.isLoading || (reimbursementAccount?.isLoading && !reimbursementAccount?.isCreateCorpayBankAccount)) &&
        (!plaidCurrentEvent || plaidCurrentEvent === CONST.BANK_ACCOUNT.PLAID.EVENTS_NAME.EXIT);

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

    if (shouldShowContinueSetupButton === true) {
        return (
            <ContinueBankAccountSetup
                reimbursementAccount={reimbursementAccount}
                onContinuePress={hasForeignCurrency ? continueNonUSDVBBASetup : continueUSDVBBASetup}
                policyName={policyName}
                onBackButtonPress={Navigation.goBack}
            />
        );
    }

    if (hasForeignCurrency) {
        return (
            <NonUSDVerifiedBankAccountFlow
                nonUSDBankAccountStep={nonUSDBankAccountStep}
                setNonUSDBankAccountStep={setNonUSDBankAccountStep}
            />
        );
    }

    return (
        <USDVerifiedBankAccountFlow
            USDBankAccountStep={currentStep}
            policyName={policyName}
            policyID={policyIDParam}
            isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}
            setIsValidateCodeActionModalVisible={setIsValidateCodeActionModalVisible}
            onBackButtonPress={goBack}
            requestorStepRef={requestorStepRef}
            onfidoToken={onfidoToken}
        />
    );
}

ReimbursementAccountPage.displayName = 'ReimbursementAccountPage';

export default withPolicy(ReimbursementAccountPage);
