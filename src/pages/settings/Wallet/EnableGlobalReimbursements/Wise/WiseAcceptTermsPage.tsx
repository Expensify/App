import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {isWiseOnboardingSubmitted} from '@libs/BankAccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isWiseGlobalReimbursementsIntroPath} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {hideBankAccountErrors} from '@userActions/BankAccounts';
import {clearSensitiveAnswers} from '@userActions/DynamicForm';
import {clearDraftValues, clearErrorFields} from '@userActions/FormActions';
import {clearWiseBusinessOnboardingSubmission, clearWiseOnboardingUnsavedPages, submitWiseBusinessOnboarding} from '@userActions/WiseOnboarding';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WiseBusinessOnboardingForm} from '@src/types/form';
import type {BankAccountList, ReimbursementAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useEffectEvent, useState} from 'react';
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

const submissionSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => ({
    isSubmitting: !!reimbursementAccount?.isSubmittingWiseBusinessOnboarding,
    isSuccess: !!reimbursementAccount?.isWiseBusinessOnboardingSubmitSuccessful,
    error: getLatestErrorMessage(reimbursementAccount),
});

const serverErrorFieldsSelector = (form: OnyxEntry<WiseBusinessOnboardingForm>) => form?.errorFields;

/** The last page of our own onboarding, after the confirmation page. Confirm submits the business to Wise once every box is ticked. */
function WiseAcceptTermsPage({route}: WiseAcceptTermsPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [accepted, setAccepted] = useState<Record<TermKey, boolean>>({certify: false, expensifyTerms: false, wiseTerms: false});
    const [shouldShowError, setShouldShowError] = useState(false);
    const [submission] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: submissionSelector});
    const [serverErrorFields] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {selector: serverErrorFieldsSelector});
    const isAlreadySubmittedSelector = (bankAccountList: OnyxEntry<BankAccountList>) => isWiseOnboardingSubmitted(bankAccountList?.[bankAccountID]?.accountData);
    const [isAlreadySubmitted = false] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: isAlreadySubmittedSelector});
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    // The terms replaced the onboarding pages, so going back to one of them puts it in their place
    const openOnboardingPage = (pageKey: string) => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(pageKey), introPath), {forceReplace: true});
    const goBackToConfirmation = () => openOnboardingPage(CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY);

    // The intro is the screen underneath, so Android's back takes the header's step instead of popping to it
    useAndroidBackButtonHandler(() => {
        goBackToConfirmation();
        return true;
    });

    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        Navigation.goBack(introPath);
    }, [isWiseReimbursementsBetaEnabled, introPath]);

    // The reimbursement account's errors and success flag are shared with the other bank account flows
    useEffect(() => {
        hideBankAccountErrors();
        clearWiseBusinessOnboardingSubmission();
        return () => {
            hideBankAccountErrors();
            clearWiseBusinessOnboardingSubmission();
        };
    }, []);

    // Confirm runs before the request's loading reaches Onyx, so a submission counts as finished only after its start was seen
    const isSubmitting = !!submission?.isSubmitting;
    const [isSubmitRequested, setIsSubmitRequested] = useState(false);
    const [hasSubmitStarted, setHasSubmitStarted] = useState(false);
    if (isSubmitRequested && isSubmitting && !hasSubmitStarted) {
        setHasSubmitStarted(true);
    }
    const hasSubmitFinished = hasSubmitStarted && !isSubmitting;
    const isSubmitSuccessful = hasSubmitFinished && !!submission?.isSuccess;
    const pageToFix = hasSubmitFinished && !isSubmitSuccessful ? getPageWithServerError(serverErrorFields) : undefined;
    const submitError = hasSubmitFinished && !isSubmitSuccessful ? submission?.error : undefined;
    // Once this submission or an earlier one sent the business to Wise, these pages have nothing left to submit
    const hasWiseBusiness = isSubmitSuccessful || isAlreadySubmitted;

    // The back path follows the focused route, so once this page is replaced it no longer ends in the terms and must not navigate again
    const leaveTerms = useEffectEvent(() => {
        if (hasWiseBusiness) {
            clearDraftValues(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
            clearSensitiveAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
            clearWiseOnboardingUnsavedPages();
            // Wise's hosted form still has to collect the owners and directors, which the status page asks for while Wise needs more info
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, introPath), {forceReplace: true});
            return;
        }
        if (!pageToFix) {
            return;
        }
        // The error shows under the field, on the page that asked for it
        openOnboardingPage(pageToFix.key);
    });

    // A deep link renders this page before the root state holds it, so the back path is not this account's intro until then
    const isIntroPathReady = isWiseGlobalReimbursementsIntroPath(introPath, bankAccountID);
    useEffect(() => {
        if (!isIntroPathReady) {
            return;
        }
        leaveTerms();
    }, [hasWiseBusiness, pageToFix, isIntroPathReady]);

    const confirm = () => {
        if (!TERM_KEYS.every((key) => accepted[key])) {
            setShouldShowError(true);
            return;
        }
        // Field errors of an earlier attempt would send the user back to a page that may be fixed already
        clearErrorFields(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        setIsSubmitRequested(true);
        setHasSubmitStarted(false);
        submitWiseBusinessOnboarding({bankAccountID, policyID: route.params.policyID, termsAccepted: true, mandateAccepted: true});
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
                <View style={styles.mt5}>
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.confirm')}
                        onSubmit={confirm}
                        isAlertVisible={shouldShowError || !!submitError}
                        message={shouldShowError ? translate('walletPage.wiseOnboarding.terms.error') : submitError}
                        isLoading={isSubmitting}
                        containerStyles={styles.mh0}
                        enabledWhenOffline={false}
                        shouldShowLoadingImmediatelyOnPress={false}
                        sentryLabel={CONST.SENTRY_LABEL.WISE_ACCEPT_TERMS.CONFIRM}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WiseAcceptTermsPage;
