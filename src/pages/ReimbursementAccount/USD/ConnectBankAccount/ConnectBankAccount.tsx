import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {View} from 'react-native';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@navigation/helpers/isNavigatorName';
import Navigation from '@navigation/Navigation';
import ConnectedVerifiedBankAccount from '@pages/ReimbursementAccount/ConnectedVerifiedBankAccount';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import BankAccountValidationForm from './components/BankAccountValidationForm';
import FinishChatCard from './components/FinishChatCard';

type ConnectBankAccountProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setShouldShowConnectedVerifiedBankAccount?: (shouldShowConnectedVerifiedBankAccount: boolean) => void;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setUSDBankAccountStep?: (step: string | null) => void;
};

function ConnectBankAccount({onBackButtonPress, setShouldShowConnectedVerifiedBankAccount, setUSDBankAccountStep}: ConnectBankAccountProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const topmostFullScreenRoute = useRootNavigationState((state) => state?.routes.findLast((lastRoute) => isFullScreenName(lastRoute.name)));

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${reimbursementAccount?.achData?.policyID}`);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const handleNavigateToConciergeChat = () => navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, true);
    const bankAccountState = reimbursementAccount?.achData?.state ?? '';

    // If a user tries to navigate directly to the validate page we'll show them the EnableStep
    if (bankAccountState === CONST.BANK_ACCOUNT.STATE.OPEN) {
        if (topmostFullScreenRoute?.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR) {
            return (
                <ScreenWrapper testID="ReimbursementAccountPage">
                    <HeaderWithBackButton
                        title={translate('bankAccount.addBankAccount')}
                        onBackButtonPress={() => Navigation.dismissModal()}
                    />
                    <ConfirmationPage
                        heading={translate('bankAccount.bbaAdded')}
                        description={translate('bankAccount.bbaAddedDescription')}
                        shouldShowButton
                        headingStyle={styles.mh5}
                        buttonText={translate('common.confirm')}
                        onButtonPress={() => Navigation.dismissModal()}
                    />
                </ScreenWrapper>
            );
        }
        return (
            <ConnectedVerifiedBankAccount
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={() => Navigation.dismissModal()}
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
