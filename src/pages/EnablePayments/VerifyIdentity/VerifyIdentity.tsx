import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import Onfido from '@components/Onfido';
import type {OnfidoData} from '@components/Onfido/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Growl from '@libs/Growl';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletOnfido} from '@src/types/onyx';

const DEFAULT_WALLET_ONFIDO_DATA = {
    isLoading: false,
    hasAcceptedPrivacyPolicy: false,
    sdkToken: '',
    applicantID: '',
};

type VerifyIdentityOnyxProps = {
    /** The wallet onfido data */
    walletOnfidoData: OnyxEntry<WalletOnfido>;
};

type VerifyIdentityProps = VerifyIdentityOnyxProps;

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function VerifyIdentity({walletOnfidoData = DEFAULT_WALLET_ONFIDO_DATA}: VerifyIdentityProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const openOnfidoFlow = () => {
        BankAccounts.openOnfidoFlow();
    };

    const handleOnfidoSuccess = useCallback(
        (onfidoData: OnfidoData) => {
            BankAccounts.verifyIdentity({
                onfidoData: JSON.stringify({
                    ...onfidoData,
                    applicantID: walletOnfidoData?.applicantID,
                }),
            });
            BankAccounts.updateAddPersonalBankAccountDraft({isOnfidoSetupComplete: true});
        },
        [walletOnfidoData?.applicantID],
    );

    const onfidoError = ErrorUtils.getLatestErrorMessage(walletOnfidoData) ?? '';

    const handleOnfidoError = () => {
        Growl.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
    };

    const goBack = () => {
        Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
    };

    return (
        <ScreenWrapper testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton
                title={translate('onfidoStep.verifyIdentity')}
                onBackButtonPress={goBack}
            />
            <View style={[styles.ph5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={2}
                    stepNames={CONST.WALLET.STEP_NAMES}
                />
            </View>
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flex1}>
                    {walletOnfidoData?.hasAcceptedPrivacyPolicy ? (
                        <Onfido
                            sdkToken={walletOnfidoData?.sdkToken ?? ''}
                            onUserExit={goBack}
                            onError={handleOnfidoError}
                            onSuccess={handleOnfidoSuccess}
                        />
                    ) : (
                        <>
                            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.m5, styles.ph5]}>
                                <Icon
                                    src={Illustrations.ToddBehindCloud}
                                    width={100}
                                    height={100}
                                />
                                <Text style={[styles.textHeadline, styles.mb2]}>{translate('onfidoStep.letsVerifyIdentity')}</Text>
                                <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('onfidoStep.butFirst')}</Text>
                            </View>
                            <FixedFooter>
                                <FormAlertWithSubmitButton
                                    isAlertVisible={Boolean(onfidoError)}
                                    onSubmit={openOnfidoFlow}
                                    message={onfidoError}
                                    isLoading={walletOnfidoData?.isLoading}
                                    buttonText={onfidoError ? translate('onfidoStep.tryAgain') : translate('common.continue')}
                                    containerStyles={[styles.mh0, styles.mv0, styles.mb0]}
                                />
                            </FixedFooter>
                        </>
                    )}
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

VerifyIdentity.displayName = 'VerifyIdentity';

export default withOnyx<VerifyIdentityProps, VerifyIdentityOnyxProps>({
    // @ts-expect-error: ONYXKEYS.PERSONAL_BANK_ACCOUNT is conflicting with ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(VerifyIdentity);
