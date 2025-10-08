import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {Bank, Connect, Lightbulb, Lock, RotateLeft} from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEarliestErrorField, getLatestError, getLatestErrorField, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {goToWithdrawalAccountSetupStep, openPlaidView, updateReimbursementAccountDraft} from '@userActions/BankAccounts';
import {openExternalLink, openExternalLinkWithToken} from '@userActions/Link';
import {requestResetBankAccount, resetReimbursementAccount, setBankAccountSubStep, setReimbursementAccountOptionPressed} from '@userActions/ReimbursementAccount';
import {clearContactMethodErrors, requestValidateCodeAction, validateSecondaryLogin} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type VerifiedBankAccountFlowEntryPointProps = {
    /** Bank account currently in setup */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Callback to continue to the next step of the setup */
    onContinuePress: () => void;

    /** The workspace name */
    policyName?: string;

    /** The workspace ID */
    policyID?: string;

    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Should show the continue setup button */
    shouldShowContinueSetupButton: boolean | null;

    /** Whether the workspace currency is set to non USD currency */
    isNonUSDWorkspace: boolean;

    /** Should ValidateCodeActionModal be displayed or not */
    isValidateCodeActionModalVisible?: boolean;

    /** Toggle ValidateCodeActionModal */
    toggleValidateCodeActionModal?: (isVisible: boolean) => void;

    /** Set step for non USD flow */
    setNonUSDBankAccountStep: (shouldShowContinueSetupButton: string | null) => void;

    /** Set step for USD flow */
    setUSDBankAccountStep: (shouldShowContinueSetupButton: string | null) => void;

    /** Method to set the state of shouldShowContinueSetupButton */
    setShouldShowContinueSetupButton?: (shouldShowContinueSetupButton: boolean) => void;
};

const bankInfoStepKeys = INPUT_IDS.BANK_INFO_STEP;

function VerifiedBankAccountFlowEntryPoint({
    policyName = '',
    policyID = '',
    onBackButtonPress,
    reimbursementAccount,
    onContinuePress,
    shouldShowContinueSetupButton,
    isNonUSDWorkspace,
    isValidateCodeActionModalVisible,
    toggleValidateCodeActionModal,
    setNonUSDBankAccountStep,
    setUSDBankAccountStep,
    setShouldShowContinueSetupButton,
}: VerifiedBankAccountFlowEntryPointProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction ?? null;
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [reimbursementAccountOptionPressed] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED, {canBeMissing: true});
    const isAccountValidated = account?.validated ?? false;

    const contactMethod = account?.primaryLogin ?? '';
    const loginData = useMemo(() => loginList?.[contactMethod], [loginList, contactMethod]);
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const plaidDesktopMessage = getPlaidDesktopMessage();
    const bankAccountRoute = `${ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_INITIAL.getRoute(policyID))}`;
    const personalBankAccounts = bankAccountList ? Object.keys(bankAccountList).filter((key) => bankAccountList[key].accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) : [];

    const removeExistingBankAccountDetails = () => {
        const bankAccountData: Partial<ReimbursementAccountForm> = {
            [bankInfoStepKeys.ROUTING_NUMBER]: '',
            [bankInfoStepKeys.ACCOUNT_NUMBER]: '',
            [bankInfoStepKeys.PLAID_MASK]: '',
            [bankInfoStepKeys.IS_SAVINGS]: undefined,
            [bankInfoStepKeys.BANK_NAME]: '',
            [bankInfoStepKeys.PLAID_ACCOUNT_ID]: '',
            [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: '',
        };
        updateReimbursementAccountDraft(bankAccountData);
    };

    /**
     * Prepares and redirects user to next step in the USD flow
     */
    const prepareNextStep = useCallback(
        (setupType: ValueOf<typeof CONST.BANK_ACCOUNT.SETUP_TYPE>) => {
            setBankAccountSubStep(setupType);
            setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.COUNTRY);
            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COUNTRY);
        },
        [setUSDBankAccountStep],
    );

    /**
     * optionPressed ref indicates what user selected before modal to validate account was displayed
     * In this hook we check if account was validated and then proceed with the option user selected
     * note: non USD accounts only have manual option available
     */
    useEffect(() => {
        if (!isAccountValidated) {
            return;
        }

        if (reimbursementAccountOptionPressed === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
            if (isNonUSDWorkspace) {
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
                setReimbursementAccountOptionPressed(CONST.BANK_ACCOUNT.SETUP_TYPE.NONE);
                return;
            }

            prepareNextStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
            setReimbursementAccountOptionPressed(CONST.BANK_ACCOUNT.SETUP_TYPE.NONE);
        } else if (reimbursementAccountOptionPressed === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
            openPlaidView();
            prepareNextStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
            setReimbursementAccountOptionPressed(CONST.BANK_ACCOUNT.SETUP_TYPE.NONE);
        }
    }, [isAccountValidated, isNonUSDWorkspace, prepareNextStep, reimbursementAccountOptionPressed, setNonUSDBankAccountStep]);

    const handleConnectManually = () => {
        if (!isAccountValidated) {
            setReimbursementAccountOptionPressed(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
            toggleValidateCodeActionModal?.(true);
            return;
        }

        if (isNonUSDWorkspace) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
            return;
        }

        removeExistingBankAccountDetails();
        prepareNextStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
    };

    const handleConnectPlaid = () => {
        if (isPlaidDisabled) {
            return;
        }

        if (!isAccountValidated) {
            setReimbursementAccountOptionPressed(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
            toggleValidateCodeActionModal?.(true);
            return;
        }

        removeExistingBankAccountDetails();
        prepareNextStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={VerifiedBankAccountFlowEntryPoint.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                subtitle={policyName}
                onBackButtonPress={onBackButtonPress}
            />

            <ScrollView style={styles.flex1}>
                <Section
                    title={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.almostDone' : 'workspace.bankAccount.streamlinePayments')}
                    titleStyles={styles.textHeadline}
                    subtitle={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.youAreAlmostDone' : 'bankAccount.toGetStarted')}
                    subtitleStyles={styles.textSupporting}
                    subtitleMuted
                    illustration={LottieAnimations.FastMoney}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    isCentralPane
                >
                    {!!plaidDesktopMessage && !isNonUSDWorkspace && (
                        <View style={[styles.mt3, styles.flexRow, styles.justifyContentBetween]}>
                            <TextLink onPress={() => openExternalLinkWithToken(bankAccountRoute)}>{translate(plaidDesktopMessage)}</TextLink>
                        </View>
                    )}
                    {!!personalBankAccounts.length && (
                        <View style={[styles.flexRow, styles.mt4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                            <Icon
                                src={Lightbulb}
                                fill={theme.icon}
                                additionalStyles={styles.mr2}
                                medium
                            />
                            <Text
                                style={[styles.textLabelSupportingNormal, styles.flex1]}
                                suppressHighlighting
                            >
                                {translate('workspace.bankAccount.connectBankAccountNote')}
                            </Text>
                        </View>
                    )}
                    <View style={styles.mt4}>
                        {shouldShowContinueSetupButton === true ? (
                            <OfflineWithFeedback
                                errors={
                                    reimbursementAccount?.maxAttemptsReached ? getMicroSecondOnyxErrorWithTranslationKey('connectBankAccountStep.maxAttemptsReached') : getLatestError(errors)
                                }
                                errorRowStyles={styles.mt2}
                                shouldShowErrorMessages
                                canDismissError={!reimbursementAccount?.maxAttemptsReached}
                                onClose={resetReimbursementAccount}
                            >
                                <MenuItem
                                    title={translate('workspace.bankAccount.continueWithSetup')}
                                    icon={Connect}
                                    onPress={onContinuePress}
                                    shouldShowRightIcon
                                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                                    disabled={!!pendingAction || (!isEmptyObject(errors) && !reimbursementAccount?.maxAttemptsReached)}
                                />
                                <MenuItem
                                    title={translate('workspace.bankAccount.startOver')}
                                    icon={RotateLeft}
                                    onPress={requestResetBankAccount}
                                    shouldShowRightIcon
                                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                                    disabled={!!pendingAction || (!isEmptyObject(errors) && !reimbursementAccount?.maxAttemptsReached)}
                                />
                            </OfflineWithFeedback>
                        ) : (
                            <>
                                {!isNonUSDWorkspace && !shouldShowContinueSetupButton && (
                                    <MenuItem
                                        title={translate('bankAccount.connectOnlineWithPlaid')}
                                        icon={Bank}
                                        disabled={!!isPlaidDisabled}
                                        onPress={handleConnectPlaid}
                                        shouldShowRightIcon
                                        outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                                    />
                                )}
                                <MenuItem
                                    title={translate('bankAccount.connectManually')}
                                    icon={Connect}
                                    onPress={handleConnectManually}
                                    shouldShowRightIcon
                                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                                />
                            </>
                        )}
                    </View>
                </Section>
                <View style={[styles.mv0, styles.mh5, styles.flexRow, styles.justifyContentBetween]}>
                    <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{translate('common.privacy')}</TextLink>
                    <PressableWithoutFeedback
                        onPress={() => openExternalLink(CONST.ENCRYPTION_AND_SECURITY_HELP_URL)}
                        style={[styles.flexRow, styles.alignItemsCenter]}
                        accessibilityLabel={translate('bankAccount.yourDataIsSecure')}
                    >
                        <TextLink href={CONST.ENCRYPTION_AND_SECURITY_HELP_URL}>{translate('bankAccount.yourDataIsSecure')}</TextLink>
                        <View style={styles.ml1}>
                            <Icon
                                src={Lock}
                                fill={theme.link}
                            />
                        </View>
                    </PressableWithoutFeedback>
                </View>
            </ScrollView>

            {!!reimbursementAccount?.shouldShowResetModal && (
                <WorkspaceResetBankAccountModal
                    reimbursementAccount={reimbursementAccount}
                    isNonUSDWorkspace={isNonUSDWorkspace}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                    setNonUSDBankAccountStep={setNonUSDBankAccountStep}
                    setShouldShowContinueSetupButton={setShouldShowContinueSetupButton}
                />
            )}

            <ValidateCodeActionModal
                title={translate('contacts.validateAccount')}
                descriptionPrimary={translate('contacts.featureRequiresValidate')}
                descriptionSecondary={translate('contacts.enterMagicCode', {contactMethod})}
                isVisible={!!isValidateCodeActionModalVisible}
                validateCodeActionErrorField="validateLogin"
                validatePendingAction={loginData?.pendingFields?.validateCodeSent}
                sendValidateCode={() => requestValidateCodeAction()}
                handleSubmitForm={(validateCode) => validateSecondaryLogin(loginList, contactMethod, validateCode, formatPhoneNumber)}
                validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
                clearError={() => clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
                onClose={() => toggleValidateCodeActionModal?.(false)}
            />
        </ScreenWrapper>
    );
}

VerifiedBankAccountFlowEntryPoint.displayName = 'VerifiedBankAccountFlowEntryPoint';

export default VerifiedBankAccountFlowEntryPoint;
