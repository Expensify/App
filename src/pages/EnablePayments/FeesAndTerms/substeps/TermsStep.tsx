import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function HaveReadAndAgreeLabel() {
    const {translate} = useLocalize();

    return (
        <Text>
            {`${translate('termsStep.haveReadAndAgree')}`}
            <TextLink href={CONST.ELECTRONIC_DISCLOSURES_URL}>{`${translate('termsStep.electronicDisclosures')}.`}</TextLink>
        </Text>
    );
}

function AgreeToTheLabel() {
    const {translate} = useLocalize();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    const walletAgreementUrl =
        userWallet?.walletProgramID && userWallet?.walletProgramID === CONST.WALLET.BANCORP_WALLET_PROGRAM_ID
            ? CONST.OLD_DOT_PUBLIC_URLS.BANCORP_WALLET_AGREEMENT_URL
            : CONST.OLD_DOT_PUBLIC_URLS.WALLET_AGREEMENT_URL;

    return (
        <Text>
            {`${translate('termsStep.agreeToThe')} `}
            <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{`${translate('common.privacy')} `}</TextLink>
            {`${translate('common.and')} `}
            <TextLink href={walletAgreementUrl}>{`${translate('termsStep.walletAgreement')}.`}</TextLink>
        </Text>
    );
}

function TermsStep({onNext}: SubStepProps) {
    const styles = useThemeStyles();
    const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);
    const [hasAcceptedPrivacyPolicyAndWalletAgreement, setHasAcceptedPrivacyPolicyAndWalletAgreement] = useState(false);
    const [error, setError] = useState(false);
    const {translate} = useLocalize();

    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);

    const errorMessage = error ? translate('common.error.acceptTerms') : ErrorUtils.getLatestErrorMessage(walletTerms ?? {}) ?? '';

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
                    accessibilityLabel={translate('termsStep.haveReadAndAgree')}
                    style={[styles.mb4, styles.mt4]}
                    onInputChange={toggleDisclosure}
                    LabelComponent={HaveReadAndAgreeLabel}
                />
                <CheckboxWithLabel
                    accessibilityLabel={translate('termsStep.agreeToThe')}
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
