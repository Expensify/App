import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {submitWiseBusinessOnboarding} from '@userActions/Wise';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DynamicFormSensitiveAnswers, WiseBusinessOnboardingSubmit} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import getPageWithServerError from './getPageWithServerError';

type WiseAcceptTermsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS>;

type TermKey = 'certify' | 'expensifyTerms' | 'wiseTerms';

const TERM_KEYS: TermKey[] = ['certify', 'expensifyTerms', 'wiseTerms'];

function TermLabel({termKey}: {termKey: TermKey}) {
    const {translate} = useLocalize();
    return <RenderHTML html={translate(`walletPage.wiseOnboarding.terms.${termKey}`)} />;
}

function CertifyLabel() {
    return <TermLabel termKey="certify" />;
}

function ExpensifyTermsLabel() {
    return <TermLabel termKey="expensifyTerms" />;
}

function WiseTermsLabel() {
    return <TermLabel termKey="wiseTerms" />;
}

// The certify term has no links, so its text doubles as its accessibility label
const TERM_ACCESSIBILITY_LABELS = {
    certify: 'walletPage.wiseOnboarding.terms.certify',
    expensifyTerms: 'walletPage.wiseOnboarding.terms.expensifyTermsAccessibilityLabel',
    wiseTerms: 'walletPage.wiseOnboarding.terms.wiseTermsAccessibilityLabel',
} as const satisfies Record<TermKey, TranslationPaths>;

// CheckboxWithLabel takes a label component without props, so each term gets its own
const TERM_LABELS: Record<TermKey, () => React.JSX.Element> = {
    certify: CertifyLabel,
    expensifyTerms: ExpensifyTermsLabel,
    wiseTerms: WiseTermsLabel,
};

const submitStateSelector = (submitState: OnyxEntry<WiseBusinessOnboardingSubmit>) => ({
    isSubmitting: !!submitState?.isLoading,
    errorMessage: getLatestErrorMessage(submitState),
});

const ssnSelector = (sensitiveAnswers: OnyxEntry<DynamicFormSensitiveAnswers>) => {
    const ssn = sensitiveAnswers?.[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]?.ssn;
    return typeof ssn === 'string' ? ssn : undefined;
};

/** The last page of our own onboarding, after the confirmation page. Every box is required before the business is submitted to Wise. */
function WiseAcceptTermsPage({route}: WiseAcceptTermsPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const confirmationPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [accepted, setAccepted] = useState<Record<TermKey, boolean>>({certify: false, expensifyTerms: false, wiseTerms: false});
    const [shouldShowError, setShouldShowError] = useState(false);
    const [submitState] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT, {selector: submitStateSelector});
    const [ssn] = useOnyx(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {selector: ssnSelector});
    const [hasAnswerToFix] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {selector: (form) => !!getPageWithServerError(form?.errorFields)});
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    const goBackToConfirmation = () => Navigation.goBack(confirmationPath);

    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToConfirmation();
    }, [isWiseReimbursementsBetaEnabled, goBackToConfirmation]);

    // Confirm runs before the request's loading reaches Onyx, so the end of a submission is read only after its start was seen
    const isSubmitting = !!submitState?.isSubmitting;
    const [isSubmitRequested, setIsSubmitRequested] = useState(false);
    const [hasSubmitStarted, setHasSubmitStarted] = useState(false);
    if (isSubmitRequested && isSubmitting && !hasSubmitStarted) {
        setHasSubmitStarted(true);
    }
    const hasSubmitFinished = hasSubmitStarted && !isSubmitting;
    const submitError = hasSubmitFinished ? (submitState?.errorMessage ?? '') : '';

    // An answer Wise rejects is fixed on the page that asked for it, which the onboarding opens once it is back on top. Any other rejection shows above Confirm.
    useEffect(() => {
        if (!hasSubmitFinished) {
            return;
        }
        if (hasAnswerToFix) {
            goBackToConfirmation();
            return;
        }
        if (submitError) {
            return;
        }
        Navigation.dismissModal();
    }, [hasSubmitFinished, hasAnswerToFix, submitError, goBackToConfirmation]);

    const confirm = () => {
        if (!TERM_KEYS.every((key) => accepted[key])) {
            setShouldShowError(true);
            return;
        }
        // The SSN lives in memory only, so a reload on this page loses it. The confirmation page sends the user back to type it again.
        if (!ssn) {
            goBackToConfirmation();
            return;
        }
        setIsSubmitRequested(true);
        setHasSubmitStarted(false);
        submitWiseBusinessOnboarding({bankAccountID, policyID: route.params.policyID, termsAccepted: true, ssn});
    };

    if (!isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper
            testID="WiseAcceptTermsPage"
            includeSafeAreaPaddingBottom
        >
            <Header>
                <Header.BackButton onPress={goBackToConfirmation} />
                <Header.Title title={translate('walletPage.wiseOnboarding.terms.title')} />
            </Header>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb2]}>{translate('walletPage.wiseOnboarding.terms.title')}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{translate('walletPage.wiseOnboarding.terms.subtitle')}</Text>
                {TERM_KEYS.map((key) => (
                    <CheckboxWithLabel
                        key={key}
                        style={styles.mb4}
                        isChecked={accepted[key]}
                        onInputChange={(isChecked) => {
                            setAccepted((current) => ({...current, [key]: !!isChecked}));
                            setShouldShowError(false);
                        }}
                        accessibilityLabel={translate(TERM_ACCESSIBILITY_LABELS[key])}
                        LabelComponent={TERM_LABELS[key]}
                    />
                ))}
                <View style={styles.flexGrow1} />
                <FormAlertWithSubmitButton
                    buttonText={translate('common.confirm')}
                    onSubmit={confirm}
                    isAlertVisible={shouldShowError || !!submitError}
                    message={shouldShowError ? translate('walletPage.wiseOnboarding.terms.error') : submitError}
                    isLoading={isSubmitting}
                    containerStyles={[styles.mh0, styles.mt5]}
                    enabledWhenOffline={false}
                    shouldShowLoadingImmediatelyOnPress={false}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WiseAcceptTermsPage;
