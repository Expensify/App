import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {openPlaidView} from '@userActions/BankAccounts';
import {openExternalLink} from '@userActions/Link';
import {requestResetFreePlanBankAccount, resetReimbursementAccount, setBankAccountSubStep} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type VerifiedBankAccountFlowEntryPointProps = {
    /** Bank account currently in setup */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** Callback to continue to the next step of the setup */
    onContinuePress: () => void;

    /** The workspace name */
    policyName?: string;

    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Should show the continue setup button */
    shouldShowContinueSetupButton: boolean | null;

    hasForeignCurrency: boolean;
};

function VerifiedBankAccountFlowEntryPoint({
    policyName = '',
    onBackButtonPress,
    reimbursementAccount,
    onContinuePress,
    shouldShowContinueSetupButton,
    hasForeignCurrency,
}: VerifiedBankAccountFlowEntryPointProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction ?? null;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={VerifiedBankAccountFlowEntryPoint.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.connectBankAccount')}
                subtitle={policyName}
                shouldShowGetAssistanceButton
                onBackButtonPress={onBackButtonPress}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
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
                    <OfflineWithFeedback
                        errors={errors}
                        shouldShowErrorMessages
                        onClose={resetReimbursementAccount}
                    >
                        {shouldShowContinueSetupButton === true ? (
                            <>
                                <MenuItem
                                    title={translate('workspace.bankAccount.continueWithSetup')}
                                    icon={Expensicons.Connect}
                                    iconFill={theme.iconMenu}
                                    onPress={onContinuePress}
                                    shouldShowRightIcon
                                    wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                />
                                <MenuItem
                                    title={translate('workspace.bankAccount.startOver')}
                                    icon={Expensicons.RotateLeft}
                                    iconFill={theme.iconMenu}
                                    onPress={requestResetFreePlanBankAccount}
                                    shouldShowRightIcon
                                    wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                    disabled={!!pendingAction || !isEmptyObject(errors)}
                                />
                            </>
                        ) : (
                            <>
                                {!hasForeignCurrency && !shouldShowContinueSetupButton && (
                                    <MenuItem
                                        title={translate('bankAccount.connectOnlineWithPlaid')}
                                        icon={Expensicons.Bank}
                                        iconFill={theme.iconMenu}
                                        // disabled={!!isPlaidDisabled}
                                        onPress={() => {}}
                                        shouldShowRightIcon
                                        wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                    />
                                )}
                                <MenuItem
                                    title={translate('bankAccount.connectManually')}
                                    icon={Expensicons.Connect}
                                    iconFill={theme.iconMenu}
                                    onPress={() => {}}
                                    shouldShowRightIcon
                                    wrapperStyle={[styles.cardMenuItem, styles.mt4]}
                                />
                            </>
                        )}
                    </OfflineWithFeedback>
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
                                src={Expensicons.Lock}
                                fill={theme.link}
                            />
                        </View>
                    </PressableWithoutFeedback>
                </View>
            </ScrollView>

            {!!reimbursementAccount?.shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
        </ScreenWrapper>
    );
}

VerifiedBankAccountFlowEntryPoint.displayName = 'VerifiedBankAccountFlowEntryPoint';

export default VerifiedBankAccountFlowEntryPoint;
