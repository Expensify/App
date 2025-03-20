import React from 'react';
import Button from '@components/Button';
import {ChatBubble, RotateLeft} from '@components/Icon/Expensicons';
import {ConciergeBubble} from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceResetBankAccountModal from '@pages/workspace/WorkspaceResetBankAccountModal';
import {requestResetBankAccount} from '@userActions/BankAccounts';
import {navigateToConciergeChat} from '@userActions/Report';
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
    const policyID = reimbursementAccount?.achData?.policyID;
    const shouldShowResetModal = reimbursementAccount?.shouldShowResetModal ?? false;
    const handleNavigateToConciergeChat = () => navigateToConciergeChat(true);

    return (
        <ScrollView style={[styles.flex1]}>
            <Section
                title={translate('workspace.bankAccount.letsFinishInChat')}
                icon={ConciergeBubble}
                containerStyles={[styles.mb8, styles.mh5]}
                titleStyles={[styles.mb3]}
            >
                <Text style={styles.mb6}>{translate('connectBankAccountStep.letsChatText')}</Text>
                <Button
                    iconStyles={[styles.customMarginButtonWithMenuItem]}
                    text={translate('connectBankAccountStep.letsChatCTA')}
                    onPress={handleNavigateToConciergeChat}
                    icon={ChatBubble}
                    shouldShowRightIcon
                    success
                    innerStyles={[styles.pr2, styles.pl4, styles.h13]}
                />
                <MenuItem
                    title={translate('workspace.bankAccount.noLetsStartOver')}
                    icon={RotateLeft}
                    onPress={requestResetBankAccount}
                    shouldShowRightIcon
                    wrapperStyle={[styles.cardMenuItem, styles.mv3]}
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
