import React from 'react';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {goToWithdrawalAccountSetupStep, requestResetBankAccount, setBankAccountSubStep} from '@userActions/BankAccounts';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import Enable2FACard from './Enable2FACard';

type FinishChatCardProps = {
    /** Bank account currently in setup */
    reimbursementAccount?: ReimbursementAccount;

    /** Boolean required to display Enable2FACard component */
    requiresTwoFactorAuth: boolean;

    /** Method to set the state of USD bank account step */
    setUSDBankAccountStep: (step: string | null) => void;
};

function FinishChatCard({requiresTwoFactorAuth, reimbursementAccount, setUSDBankAccountStep}: FinishChatCardProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const policyID = reimbursementAccount?.achData?.policyID;
    const shouldShowResetModal = reimbursementAccount?.shouldShowResetModal ?? false;
    const handleNavigateToConciergeChat = () => navigateToConciergeChat(conciergeReportID, true, undefined, undefined, reimbursementAccount?.achData?.ACHRequestReportActionID);

    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'ChatBubble', 'RotateLeft'] as const);
    const illustrations = useMemoizedLazyIllustrations(['ConciergeBubble']);

    return (
        <ScrollView style={[styles.flex1]}>
            <Section
                title={translate('workspace.bankAccount.letsFinishInChat')}
                icon={illustrations.ConciergeBubble}
                containerStyles={[styles.mb8, styles.mh5]}
                titleStyles={[styles.mb3]}
            >
                <Text style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text>
                <MenuItem
                    icon={icons.ChatBubble}
                    title={translate('workspace.bankAccount.finishInChat')}
                    onPress={handleNavigateToConciergeChat}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
                <MenuItem
                    icon={icons.Pencil}
                    title={translate('workspace.bankAccount.updateDetails')}
                    onPress={() => {
                        setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL).then(() => {
                            setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                        });
                    }}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
                <MenuItem
                    icon={icons.RotateLeft}
                    title={translate('workspace.bankAccount.startOver')}
                    onPress={requestResetBankAccount}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
            </Section>
            {!requiresTwoFactorAuth && <Enable2FACard policyID={policyID} />}
            {shouldShowResetModal && (
                <WorkspaceResetBankAccountModal
                    reimbursementAccount={reimbursementAccount}
                    isNonUSDWorkspace={false}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                />
            )}
        </ScrollView>
    );
}

export default FinishChatCard;
