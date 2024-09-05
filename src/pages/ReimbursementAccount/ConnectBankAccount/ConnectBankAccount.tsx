import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import EnableBankAccount from '@pages/ReimbursementAccount/EnableBankAccount/EnableBankAccount';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Policy, ReimbursementAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BankAccountValidationForm from './components/BankAccountValidationForm';
import FinishChatCard from './components/FinishChatCard';

type ConnectBankAccountOnyxProps = {
    /** User's account who is setting up bank account */
    account: OnyxEntry<Account>;

    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type ConnectBankAccountProps = ConnectBankAccountOnyxProps & {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccount;

    /** Handles back button press */
    onBackButtonPress: () => void;
};

function ConnectBankAccount({reimbursementAccount, onBackButtonPress, account, policy}: ConnectBankAccountProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleNavigateToConciergeChat = () => Report.navigateToConciergeChat(true);
    const bankAccountState = reimbursementAccount.achData?.state ?? '';

    // If a user tries to navigate directly to the validate page we'll show them the EnableStep
    if (bankAccountState === BankAccount.STATE.OPEN) {
        return (
            <EnableBankAccount
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    const maxAttemptsReached = reimbursementAccount.maxAttemptsReached ?? false;
    const isBankAccountVerifying = !maxAttemptsReached && bankAccountState === BankAccount.STATE.VERIFYING;
    const isBankAccountPending = bankAccountState === BankAccount.STATE.PENDING;
    const requiresTwoFactorAuth = account?.requiresTwoFactorAuth ?? false;

    return (
        <ScreenWrapper
            testID={ConnectBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={isBankAccountPending ? translate('connectBankAccountStep.validateYourBankAccount') : translate('connectBankAccountStep.connectBankAccount')}
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
                />
            )}
        </ScreenWrapper>
    );
}

ConnectBankAccount.displayName = 'ConnectBankAccount';

export default function ComponentWithOnyx(props: Omit<ConnectBankAccountProps, keyof ConnectBankAccountOnyxProps>) {
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${reimbursementAccount?.achData?.policyID}`);

    if (isLoadingOnyxValue(accountMetadata, policyMetadata, reimbursementAccountMetadata)) {
        return null;
    }

    return (
        <ConnectBankAccount
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            account={account}
            policy={policy}
            // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
            reimbursementAccount={reimbursementAccount}
        />
    );
}
