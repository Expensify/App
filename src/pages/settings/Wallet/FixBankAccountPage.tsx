import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/ButtonComposed';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearResendFailedValidationAmountsErrors, resendFailedValidationAmounts} from '@libs/actions/BankAccounts';
import {hasDebitBlockedError, hasInsufficientFundsError} from '@libs/BankAccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type FixBankAccountPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_FIX_BANK_ACCOUNT>['route'];

function FixBankAccountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<FixBankAccountPageRoute>();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.FIX_BANK_ACCOUNT.path);
    const {isOffline} = useNetwork();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const illustrations = useMemoizedLazyIllustrations(['LaptopWithSecondScreenBank', 'ScissorsCuttingMoney']);

    const bankAccountID = route.params?.bankAccountID ? Number(route.params?.bankAccountID) : undefined;
    const [bankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: (list) => (route.params?.bankAccountID ? list?.[route.params?.bankAccountID] : undefined),
    });
    const accountData = bankAccount?.accountData;

    const isInsufficientFunds = hasInsufficientFundsError(accountData);
    const isDebitBlocked = hasDebitBlockedError(accountData);
    const isValidationFailed = accountData?.state === CONST.BANK_ACCOUNT.STATE.VALIDATION_FAILED && (isInsufficientFunds || isDebitBlocked);

    const isLoading = !!bankAccount?.pendingFields?.accountData;
    const resendErrorMessage = getLatestErrorMessage(bankAccount);
    const didSend = hasSubmitted && !isLoading && !isValidationFailed && !resendErrorMessage;

    // Clear stale errors when the RHP unmounts so the next open starts clean.
    useEffect(
        () => () => {
            if (!bankAccountID) {
                return;
            }
            clearResendFailedValidationAmountsErrors(bankAccountID);
        },
        [bankAccountID],
    );

    const onResend = () => {
        if (!bankAccountID) {
            return;
        }
        setHasSubmitted(true);
        resendFailedValidationAmounts(bankAccountID);
    };

    const onDismiss = () => Navigation.dismissModal();
    const onBack = () => Navigation.goBack(backPath);

    const resendButton = (
        <View>
            {!!resendErrorMessage && (
                <View style={[styles.pAbsolute, styles.l0, styles.r0, styles.bFull, styles.mb2]}>
                    <FormHelpMessage
                        isError
                        message={resendErrorMessage}
                    />
                </View>
            )}
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                isLoading={isLoading}
                isDisabled={isOffline || isLoading}
                onPress={onResend}
            >
                <Button.Text>{translate('walletPage.fixBankAccount.resendButton')}</Button.Text>
            </Button>
        </View>
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="FixBankAccountPage"
        >
            <FullPageNotFoundView shouldShow={!isValidationFailed && !didSend}>
                <HeaderWithBackButton
                    title={translate('walletPage.fixBankAccount.title')}
                    onBackButtonPress={didSend ? onDismiss : onBack}
                />
                {didSend && (
                    <ConfirmationPage
                        illustration={illustrations.LaptopWithSecondScreenBank}
                        heading={translate('walletPage.fixBankAccount.successTitle')}
                        description={translate('walletPage.fixBankAccount.successBody')}
                        descriptionStyle={styles.textSupportingNormal}
                        shouldShowButton
                        buttonText={translate('walletPage.fixBankAccount.successButton')}
                        onButtonPress={onDismiss}
                        containerStyle={styles.flex1}
                    />
                )}
                {!didSend && isInsufficientFunds && (
                    <>
                        <ConfirmationPage
                            illustration={illustrations.ScissorsCuttingMoney}
                            heading={translate('common.actionRequired')}
                            description={translate('walletPage.fixBankAccount.insufficientFundsBody')}
                            descriptionStyle={styles.textSupportingNormal}
                            containerStyle={styles.flex1}
                        />
                        <FixedFooter>{resendButton}</FixedFooter>
                    </>
                )}
                {!didSend && !isInsufficientFunds && (
                    <>
                        <View style={[styles.flex1, styles.ph5]}>
                            <Text style={[styles.textHeadlineH1, styles.mb3]}>{translate('common.actionRequired')}</Text>
                            <RenderHTML html={translate('walletPage.fixBankAccount.debitBlockedBody')} />
                        </View>
                        <FixedFooter>{resendButton}</FixedFooter>
                    </>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default FixBankAccountPage;
