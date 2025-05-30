import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as BankAccounts from '@userActions/BankAccounts';
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

    return (
        <Text>
            {`${translate('termsStep.haveReadAndAgree')}`}
            <TextLink href={CONST.ELECTRONIC_DISCLOSURES_URL}>{`${translate('termsStep.electronicDisclosures')}.`}</TextLink>
        </Text>
    );
}

function AgreeToTheLabel() {
    const {translate} = useLocalize();

    return (
        <Text>
            {`${translate('termsStep.agreeToThe')} `}
            <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{`${translate('common.privacy')} `}</TextLink>
            {`${translate('common.and')} `}
            <TextLink href={CONST.OLD_DOT_PUBLIC_URLS.WALLET_AGREEMENT_URL}>{`${translate('termsStep.walletAgreement')}.`}</TextLink>
        </Text>
    );
}

function TermsStep(props: TermsStepProps) {
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
                <FormAlertWithSubmitButton
                    buttonText={translate('termsStep.enablePayments')}
                    onSubmit={() => {
                        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
                            setError(true);
                            return;
                        }

                        setError(false);
                        BankAccounts.acceptWalletTerms({
                            hasAcceptedTerms: hasAcceptedDisclosure && hasAcceptedPrivacyPolicyAndWalletAgreement,
                            reportID: walletTerms?.chatReportID ?? '-1',
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

TermsStep.displayName = 'TermsPage';

export default TermsStep;
