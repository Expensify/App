import React from 'react';
import {ChatBubble, Pencil, RotateLeft} from '@components/Icon/Expensicons';
import {ConciergeBubble} from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {goToWithdrawalAccountSetupStep, requestResetBankAccount, setBankAccountSubStep} from '@userActions/BankAccounts';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
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
    const policyID = reimbursementAccount?.achData?.policyID;
    const shouldShowResetModal = reimbursementAccount?.shouldShowResetModal ?? false;
    const handleNavigateToConciergeChat = () => navigateToConciergeChat(true, undefined, undefined, reimbursementAccount?.achData?.ACHRequestReportActionID);

    return (
        <ScrollView style={[styles.flex1]}>
            <Section
                title={translate('workspace.bankAccount.letsFinishInChat')}
                icon={ConciergeBubble}
                containerStyles={[styles.mb8, styles.mh5]}
                titleStyles={[styles.mb3]}
            >
                <Text style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text>
                <MenuItem
                    icon={ChatBubble}
                    title={translate('workspace.bankAccount.finishInChat')}
                    onPress={handleNavigateToConciergeChat}
                    outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
                    shouldShowRightIcon
                />
                <MenuItem
                    icon={Pencil}
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
                    icon={RotateLeft}
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

FinishChatCard.displayName = 'FinishChatCard';

export default FinishChatCard;
