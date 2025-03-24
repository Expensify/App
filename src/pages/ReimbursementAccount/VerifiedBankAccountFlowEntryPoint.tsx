import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEarliestErrorField, getLatestError, getLatestErrorField} from '@libs/ErrorUtils';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {openPlaidView, updateReimbursementAccountDraft} from '@userActions/BankAccounts';
import {openExternalLink, openExternalLinkWithToken} from '@userActions/Link';
import {requestResetBankAccount, resetReimbursementAccount, setBankAccountSubStep} from '@userActions/ReimbursementAccount';
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
}: VerifiedBankAccountFlowEntryPointProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction ?? null;
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const optionPressed = useRef('');

    const contactMethod = account?.primaryLogin ?? '';
    const loginData = useMemo(() => loginList?.[contactMethod], [loginList, contactMethod]);
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const hasMagicCodeBeenSent = !!loginData?.validateCodeSent;
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
     * optionPressed ref indicates what user selected before modal to validate account was displayed
     * In this hook we check if account was validated and then proceed with the option user selected
     * note: non USD accounts only have manual option available
     */
    useEffect(() => {
        if (!account?.validated) {
            return;
        }

        if (optionPressed.current === CONST.BANK_ACCOUNT.SUBSTEP.MANUAL) {
            if (isNonUSDWorkspace) {
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
                return;
            }

            setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
            setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        } else if (optionPressed.current === CONST.BANK_ACCOUNT.SUBSTEP.PLAID) {
            setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
            openPlaidView();
        }
    }, [account?.validated, isNonUSDWorkspace, setNonUSDBankAccountStep, setUSDBankAccountStep]);

    const handleConnectPlaid = () => {
        if (isPlaidDisabled) {
            return;
        }
        if (!account?.validated) {
            optionPressed.current = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
            toggleValidateCodeActionModal?.(true);
            return;
        }

        removeExistingBankAccountDetails();
        setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
        setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        openPlaidView();
    };

    const handleConnectManually = () => {
        if (!account?.validated) {
            optionPressed.current = CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
            toggleValidateCodeActionModal?.(true);
            return;
        }

        if (isNonUSDWorkspace) {
            setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
            return;
        }

        removeExistingBankAccountDetails();
        setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
        setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={VerifiedBankAccountFlowEntryPoint.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                subtitle={policyName}
                onBackButtonPress={onBackButtonPress}
            />

            <ScrollView style={styles.flex1}>
                <Section
                    title={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.almostDone' : 'workspace.bankAccount.streamlinePayments')}
                    titleStyles={styles.textHeadline}
                    subtitle={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.youreAlmostDone' : 'bankAccount.toGetStarted')}
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
                    {shouldShowContinueSetupButton === true ? (
                        <OfflineWithFeedback
                            errors={getLatestError(errors)}
                            shouldShowErrorMessages
                            onClose={resetReimbursementAccount}
                        >
                            <MenuItem
                                title={translate('workspace.bankAccount.continueWithSetup')}
                                icon={Connect}
                                iconFill={theme.icon}
                                onPress={onContinuePress}
                                shouldShowRightIcon
                                wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                disabled={!!pendingAction || !isEmptyObject(errors)}
                            />
                            <MenuItem
                                title={translate('workspace.bankAccount.startOver')}
                                icon={RotateLeft}
                                iconFill={theme.icon}
                                onPress={requestResetBankAccount}
                                shouldShowRightIcon
                                wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                disabled={!!pendingAction || !isEmptyObject(errors)}
                            />
                        </OfflineWithFeedback>
                    ) : (
                        <>
                            {!isNonUSDWorkspace && !shouldShowContinueSetupButton && (
                                <MenuItem
                                    title={translate('bankAccount.connectOnlineWithPlaid')}
                                    icon={Bank}
                                    iconFill={theme.icon}
                                    disabled={!!isPlaidDisabled}
                                    onPress={handleConnectPlaid}
                                    shouldShowRightIcon
                                    wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                />
                            )}
                            <MenuItem
                                title={translate('bankAccount.connectManually')}
                                icon={Connect}
                                iconFill={theme.icon}
                                onPress={handleConnectManually}
                                shouldShowRightIcon
                                wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                            />
                        </>
                    )}
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
                />
            )}

            <ValidateCodeActionModal
                title={translate('contacts.validateAccount')}
                descriptionPrimary={translate('contacts.featureRequiresValidate')}
                descriptionSecondary={translate('contacts.enterMagicCode', {contactMethod})}
                isVisible={!!isValidateCodeActionModalVisible}
                hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                validatePendingAction={loginData?.pendingFields?.validateCodeSent}
                sendValidateCode={() => requestValidateCodeAction()}
                handleSubmitForm={(validateCode) => validateSecondaryLogin(loginList, contactMethod, validateCode)}
                validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
                clearError={() => clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
                onClose={() => toggleValidateCodeActionModal?.(false)}
            />
        </ScreenWrapper>
    );
}

VerifiedBankAccountFlowEntryPoint.displayName = 'VerifiedBankAccountFlowEntryPoint';

export default VerifiedBankAccountFlowEntryPoint;
