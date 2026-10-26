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
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import {clearSensitiveAnswers} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

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

/** The last page of our own onboarding, after the confirmation page. Every box is required to continue. */
function WiseAcceptTermsPage() {
    const confirmationPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [accepted, setAccepted] = useState<Record<TermKey, boolean>>({certify: false, expensifyTerms: false, wiseTerms: false});
    const [shouldShowError, setShouldShowError] = useState(false);
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    const goBackToConfirmation = () => Navigation.goBack(confirmationPath);

    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToConfirmation();
    }, [isWiseReimbursementsBetaEnabled, goBackToConfirmation]);

    const confirm = () => {
        if (!TERM_KEYS.every((key) => accepted[key])) {
            setShouldShowError(true);
            return;
        }
        clearSensitiveAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        Navigation.dismissModal();
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
                    isAlertVisible={shouldShowError}
                    message={translate('walletPage.wiseOnboarding.terms.error')}
                    containerStyles={[styles.mh0, styles.mt5]}
                    enabledWhenOffline={false}
                    shouldShowLoadingImmediatelyOnPress={false}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WiseAcceptTermsPage;
