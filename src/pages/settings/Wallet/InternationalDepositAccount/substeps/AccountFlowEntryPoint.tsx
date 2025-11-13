import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback} from 'react';
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
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {goToWithdrawalAccountSetupStep} from '@userActions/BankAccounts';
import {openExternalLink} from '@userActions/Link';
import {requestResetBankAccount, resetReimbursementAccount, setBankAccountSubStep, setReimbursementAccountOptionPressed} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AccountFlowEntryPointProps = {
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

function AccountFlowEntryPoint({
    policyName = '',
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
}: AccountFlowEntryPointProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: false});

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED, {canBeMissing: true});
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction ?? null;
    const isAccountValidated = account?.validated ?? false;

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

        prepareNextStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
    };

    const handleConnectPlaid = () => {
        if (isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
        } else {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT);
        }
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AccountFlowEntryPoint.displayName}
            shouldShowOfflineIndicatorInWideScreen={!!isValidateCodeActionModalVisible}
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
                    subtitle={translate(shouldShowContinueSetupButton === true ? 'workspace.bankAccount.youAreAlmostDone' : 'addPersonalBankAccount.toGetStarted')}
                    subtitleStyles={styles.textSupporting}
                    subtitleMuted
                    illustration={LottieAnimations.FastMoney}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    isCentralPane
                >
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
                                <MenuItem
                                    title={translate('bankAccount.connectOnlineWithPlaid')}
                                    icon={Bank}
                                    disabled={!!isPlaidDisabled}
                                    onPress={handleConnectPlaid}
                                    shouldShowRightIcon
                                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                                />
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
        </ScreenWrapper>
    );
}

AccountFlowEntryPoint.displayName = 'AccountFlowEntryPoint';

export default AccountFlowEntryPoint;
