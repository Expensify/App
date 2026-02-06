import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ConnectedVerifiedBankAccount from '@pages/ReimbursementAccount/ConnectedVerifiedBankAccount';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BankAccountValidationForm from './components/BankAccountValidationForm';
import FinishChatCard from './components/FinishChatCard';

type ConnectBankAccountProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setShouldShowConnectedVerifiedBankAccount: (shouldShowConnectedVerifiedBankAccount: boolean) => void;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setUSDBankAccountStep: (step: string | null) => void;
};

function ConnectBankAccount({onBackButtonPress, setShouldShowConnectedVerifiedBankAccount, setUSDBankAccountStep}: ConnectBankAccountProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${reimbursementAccount?.achData?.policyID}`, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const handleNavigateToConciergeChat = () => navigateToConciergeChat(conciergeReportID, true);
    const bankAccountState = reimbursementAccount?.achData?.state ?? '';

    // If a user tries to navigate directly to the validate page we'll show them the EnableStep
    if (bankAccountState === CONST.BANK_ACCOUNT.STATE.OPEN) {
        return (
            <ConnectedVerifiedBankAccount
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={onBackButtonPress}
                setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
                setUSDBankAccountStep={setUSDBankAccountStep}
                isNonUSDWorkspace={false}
            />
        );
    }

    const maxAttemptsReached = reimbursementAccount?.maxAttemptsReached ?? false;
    const isBankAccountVerifying = !maxAttemptsReached && bankAccountState === CONST.BANK_ACCOUNT.STATE.VERIFYING;
    const isBankAccountPending = bankAccountState === CONST.BANK_ACCOUNT.STATE.PENDING;
    const requiresTwoFactorAuth = account?.requiresTwoFactorAuth ?? false;

    return (
        <ScreenWrapper
            testID="ConnectBankAccount"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={isBankAccountPending ? translate('connectBankAccountStep.validateYourBankAccount') : translate('bankAccount.addBankAccount')}
                onBackButtonPress={onBackButtonPress}
            />
            {maxAttemptsReached && (
                <View style={[styles.m5, styles.flex1]}>
                    <Text>
                        {translate('connectBankAccountStep.maxAttemptsReached')} {translate('common.please')}{' '}
                        <TextLink onPress={handleNavigateToConciergeChat}>{translate('common.contactUs')}</TextLink>.
                    </Text>
                </View>
            )}
            {!maxAttemptsReached && isBankAccountPending && (
                <BankAccountValidationForm
                    requiresTwoFactorAuth={requiresTwoFactorAuth}
                    reimbursementAccount={reimbursementAccount}
                    policy={policy}
                />
            )}
            {isBankAccountVerifying && (
                <FinishChatCard
                    requiresTwoFactorAuth={requiresTwoFactorAuth}
                    reimbursementAccount={reimbursementAccount}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                />
            )}
        </ScreenWrapper>
    );
}

export default ConnectBankAccount;
