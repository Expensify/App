import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePressLoading from '@hooks/usePressLoading';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

function HaveReadAndAgreeLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={`${translate('termsStep.haveReadAndAgree')}`} />;
}

function AgreeToTheLabel() {
    const {translate} = useLocalize();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    const walletAgreementUrl =
        userWallet?.walletProgramID && userWallet?.walletProgramID === CONST.WALLET.BANCORP_WALLET_PROGRAM_ID
            ? CONST.OLD_DOT_PUBLIC_URLS.BANCORP_WALLET_AGREEMENT_URL
            : CONST.OLD_DOT_PUBLIC_URLS.WALLET_AGREEMENT_URL;

    return <RenderHTML html={`${translate('termsStep.agreeToThe', walletAgreementUrl)}`} />;
}

function TermsStep({onNext}: SubPageProps) {
    const styles = useThemeStyles();
    const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);
    const [hasAcceptedPrivacyPolicyAndWalletAgreement, setHasAcceptedPrivacyPolicyAndWalletAgreement] = useState(false);
    const [error, setError] = useState(false);
    const {translate} = useLocalize();

    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const {isLoading, startWithLoading} = usePressLoading({isLoading: !!walletTerms?.isLoading});

    const errorMessage = error ? translate('common.error.acceptTerms') : (getLatestErrorMessage(walletTerms ?? {}) ?? '');

    const toggleDisclosure = () => {
        setHasAcceptedDisclosure(!hasAcceptedDisclosure);
    };

    const togglePrivacyPolicy = () => {
        setHasAcceptedPrivacyPolicyAndWalletAgreement(!hasAcceptedPrivacyPolicyAndWalletAgreement);
    };

    const submit = () => {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            setError(true);
            return;
        }
        setError(false);
        startWithLoading(() => {
            onNext();
        });
    };

    /** clear error */
    useEffect(() => {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- clears the validation error immediately when both checkboxes become checked, so the error doesn't persist until the next submit attempt
        setError(false);
    }, [hasAcceptedDisclosure, hasAcceptedPrivacyPolicyAndWalletAgreement]);

    return (
        <View style={[styles.flexGrow1, styles.ph5]}>
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('termsStep.checkTheBoxes')}</Text>
            <Text style={[styles.mt3, styles.mb3, styles.textSupporting]}>{translate('termsStep.agreeToTerms')}</Text>
            <View style={styles.flex1}>
                <CheckboxWithLabel
                    accessibilityLabel={translate('termsStep.haveReadAndAgreePlain')}
                    style={[styles.mb4, styles.mt4]}
                    onInputChange={toggleDisclosure}
                    LabelComponent={HaveReadAndAgreeLabel}
                />
                <CheckboxWithLabel
                    accessibilityLabel={translate('termsStep.agreeToThePlain')}
                    onInputChange={togglePrivacyPolicy}
                    LabelComponent={AgreeToTheLabel}
                />
            </View>
            <FormAlertWithSubmitButton
                buttonText={translate('termsStep.enablePayments')}
                onSubmit={submit}
                message={errorMessage}
                isAlertVisible={error || !!errorMessage}
                shouldShowLoadingImmediatelyOnPress={false}
                isLoading={isLoading}
                containerStyles={[styles.mh0, styles.mv5]}
            />
        </View>
    );
}

export default TermsStep;
