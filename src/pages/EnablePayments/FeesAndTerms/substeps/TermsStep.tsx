import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
// TODO: uncomment at the end of the refactor https://github.com/Expensify/App/issues/36648
// import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
            <TextLink href={CONST.PRIVACY_URL}>{`${translate('common.privacy')} `}</TextLink>
            {`${translate('common.and')} `}
            <TextLink href={CONST.WALLET_AGREEMENT_URL}>{`${translate('termsStep.walletAgreement')}.`}</TextLink>
        </Text>
    );
}

function TermsStep() {
    const styles = useThemeStyles();
    const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);
    const [hasAcceptedPrivacyPolicyAndWalletAgreement, setHasAcceptedPrivacyPolicyAndWalletAgreement] = useState(false);
    const [error, setError] = useState(false);
    const {translate} = useLocalize();

    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);

    const errorMessage = error ? 'common.error.acceptTerms' : ErrorUtils.getLatestErrorMessage(walletTerms ?? {}) ?? '';

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
        <View style={[styles.flexGrow1, styles.ph5]}>
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('termsStep.checkPlease')}</Text>
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
                onSubmit={() => {
                    if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
                        setError(true);
                        return;
                    }

                    setError(false);
                    // TODO: uncomment at the end of the refactor https://github.com/Expensify/App/issues/36648
                    // BankAccounts.acceptWalletTerms({
                    //     hasAcceptedTerms: hasAcceptedDisclosure && hasAcceptedPrivacyPolicyAndWalletAgreement,
                    //     reportID: walletTerms?.chatReportID ?? '',
                    // });
                    Navigation.navigate(ROUTES.SETTINGS_WALLET);
                }}
                message={errorMessage}
                isAlertVisible={error || !!errorMessage}
                isLoading={!!walletTerms?.isLoading}
                containerStyles={[styles.mh0, styles.mv5]}
            />
        </View>
    );
}

export default TermsStep;
