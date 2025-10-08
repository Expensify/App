import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function HaveReadAndAgreeLabel() {
    const {translate} = useLocalize();
    return <RenderHTML html={`${translate('termsStep.haveReadAndAgree')}`} />;
}

function AgreeToTheLabel() {
    const {translate} = useLocalize();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});

    const walletAgreementUrl =
        userWallet?.walletProgramID && userWallet?.walletProgramID === CONST.WALLET.BANCORP_WALLET_PROGRAM_ID
            ? CONST.OLD_DOT_PUBLIC_URLS.BANCORP_WALLET_AGREEMENT_URL
            : CONST.OLD_DOT_PUBLIC_URLS.WALLET_AGREEMENT_URL;

    return <RenderHTML html={`${translate('termsStep.agreeToThe', {walletAgreementUrl})}`} />;
}

function TermsStep({onNext}: SubStepProps) {
    const styles = useThemeStyles();
    const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);
    const [hasAcceptedPrivacyPolicyAndWalletAgreement, setHasAcceptedPrivacyPolicyAndWalletAgreement] = useState(false);
    const [error, setError] = useState(false);
    const {translate} = useLocalize();

    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});

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
        onNext();
    };

    /** clear error */
    useEffect(() => {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }

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
                isLoading={!!walletTerms?.isLoading}
                containerStyles={[styles.mh0, styles.mv5]}
            />
        </View>
    );
}

export default TermsStep;
