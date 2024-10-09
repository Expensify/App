import React from 'react';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Report from '@userActions/Report';
import type {ReimbursementAccount} from '@src/types/onyx';
import Enable2FACard from './Enable2FACard';

type FinishChatCardProps = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccount;

    /** Boolean required to display Enable2FACard component */
    requiresTwoFactorAuth: boolean;
};

function FinishChatCard({requiresTwoFactorAuth, reimbursementAccount}: FinishChatCardProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = reimbursementAccount?.achData?.policyID;
    const shouldShowResetModal = reimbursementAccount.shouldShowResetModal ?? false;
    const handleNavigateToConciergeChat = () => Report.navigateToConciergeChat(true);

    return (
        <ScrollView style={[styles.flex1]}>
            <Section
                title={translate('workspace.bankAccount.letsFinishInChat')}
                icon={Illustrations.ConciergeBubble}
                containerStyles={[styles.mb8, styles.mh5]}
                titleStyles={[styles.mb3]}
            >
                <Text style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text>
                <Button
                    iconStyles={[styles.customMarginButtonWithMenuItem]}
                    text={translate('connectBankAccountStep.letsChatCTA')}
                    onPress={handleNavigateToConciergeChat}
                    icon={Expensicons.ChatBubble}
                    shouldShowRightIcon
                    success
                    innerStyles={[styles.pr2, styles.pl4, styles.h13]}
                />
                <MenuItem
                    title={translate('workspace.bankAccount.noLetsStartOver')}
                    icon={Expensicons.RotateLeft}
                    onPress={BankAccounts.requestResetFreePlanBankAccount}
                    shouldShowRightIcon
                    wrapperStyle={[styles.cardMenuItem, styles.mv3]}
                />
            </Section>
            {!requiresTwoFactorAuth && <Enable2FACard policyID={policyID} />}
            {shouldShowResetModal && <WorkspaceResetBankAccountModal reimbursementAccount={reimbursementAccount} />}
        </ScrollView>
    );
}

FinishChatCard.displayName = 'FinishChatCard';

export default FinishChatCard;
