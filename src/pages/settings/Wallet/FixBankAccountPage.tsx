import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {resendFailedValidationAmounts} from '@libs/actions/BankAccounts';
import {hasDebitBlockedError, hasInsufficientFundsError} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';

type FixBankAccountPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_FIX_BANK_ACCOUNT>['route'];

function FixBankAccountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<FixBankAccountPageRoute>();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.FIX_BANK_ACCOUNT.path);
    const [didSend, setDidSend] = useState(false);

    const bankAccountIDParam = route.params?.bankAccountID;
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const bankAccount = bankAccountIDParam ? bankAccountList?.[bankAccountIDParam] : undefined;
    const accountData = bankAccount?.accountData;

    const isInsufficientFunds = hasInsufficientFundsError(accountData);
    const isDebitBlocked = hasDebitBlockedError(accountData);
    const isValidationFailed = accountData?.state === CONST.BANK_ACCOUNT.STATE.VALIDATION_FAILED && (isInsufficientFunds || isDebitBlocked);

    const onResend = () => {
        if (!bankAccountIDParam) {
            return;
        }
        resendFailedValidationAmounts(Number(bankAccountIDParam));
        setDidSend(true);
    };

    const onDismiss = () => Navigation.dismissModal();
    const onBack = () => Navigation.goBack(backPath);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={FixBankAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('walletPage.fixBankAccount.title')}
                onBackButtonPress={didSend ? onDismiss : onBack}
            />
            <FullPageNotFoundView shouldShow={!isValidationFailed && !didSend}>
                {didSend && (
                    <ConfirmationPage
                        illustration={LottieAnimations.Fireworks}
                        heading={translate('walletPage.fixBankAccount.successTitle')}
                        description={translate('walletPage.fixBankAccount.successBody')}
                        descriptionStyle={styles.mutedTextLabel}
                        shouldShowButton
                        buttonText={translate('walletPage.fixBankAccount.successButton')}
                        onButtonPress={onDismiss}
                        containerStyle={styles.flex1}
                    />
                )}
                {!didSend && isInsufficientFunds && (
                    <ConfirmationPage
                        illustration={LottieAnimations.Fireworks}
                        heading={translate('common.actionRequired')}
                        description={<RenderHTML html={translate('walletPage.fixBankAccount.insufficientFundsBody')} />}
                        shouldShowButton
                        buttonText={translate('walletPage.fixBankAccount.resendButton')}
                        onButtonPress={onResend}
                        containerStyle={styles.flex1}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

FixBankAccountPage.displayName = 'FixBankAccountPage';

export default FixBankAccountPage;
