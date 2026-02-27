import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {acceptWalletTerms} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserWallet} from '@src/types/onyx';
import LongTermsForm from './TermsPage/LongTermsForm';
import ShortTermsForm from './TermsPage/ShortTermsForm';

type TermsStepProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;
};

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

function TermsStep(props: TermsStepProps) {
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

    /** clear error */
    useEffect(() => {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }

        setError(false);
    }, [hasAcceptedDisclosure, hasAcceptedPrivacyPolicyAndWalletAgreement]);

    return (
        <>
            <HeaderWithBackButton title={translate('termsStep.headerTitle')} />

            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.ph5}
            >
                <ShortTermsForm userWallet={props.userWallet} />
                <LongTermsForm />
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
                <FormAlertWithSubmitButton
                    buttonText={translate('termsStep.enablePayments')}
                    onSubmit={() => {
                        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
                            setError(true);
                            return;
                        }

                        setError(false);
                        acceptWalletTerms({
                            hasAcceptedTerms: hasAcceptedDisclosure && hasAcceptedPrivacyPolicyAndWalletAgreement,
                            // eslint-disable-next-line rulesdir/no-default-id-values
                            reportID: walletTerms?.chatReportID ?? '',
                        });
                    }}
                    message={errorMessage}
                    isAlertVisible={error || !!errorMessage}
                    isLoading={!!walletTerms?.isLoading}
                    containerStyles={[styles.mh0, styles.mv4]}
                />
            </ScrollView>
        </>
    );
}

export default TermsStep;
