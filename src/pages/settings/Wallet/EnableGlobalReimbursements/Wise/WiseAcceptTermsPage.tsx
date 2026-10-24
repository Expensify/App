import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Header from '@components/Header';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {submitWiseBusinessOnboarding} from '@libs/actions/Wise';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

type WiseAcceptTermsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_ACCEPT_TERMS>;

type TermKey = 'certify' | 'expensifyTerms' | 'wiseTerms';

const TERM_KEYS: TermKey[] = ['certify', 'expensifyTerms', 'wiseTerms'];

function TermLabel({termKey}: {termKey: TermKey}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <View style={[styles.flex1, styles.ml3]}>
            <RenderHTML html={translate(`walletPage.wiseOnboarding.terms.${termKey}`)} />
        </View>
    );
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

// CheckboxWithLabel takes a label component without props, so each term gets its own
const TERM_LABELS: Record<TermKey, () => React.JSX.Element> = {
    certify: CertifyLabel,
    expensifyTerms: ExpensifyTermsLabel,
    wiseTerms: WiseTermsLabel,
};

/** The last page of our own onboarding. Every box is required before the business is submitted to Wise. */
function WiseAcceptTermsPage({route}: WiseAcceptTermsPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [accepted, setAccepted] = useState<Record<TermKey, boolean>>({certify: false, expensifyTerms: false, wiseTerms: false});
    const [shouldShowError, setShouldShowError] = useState(false);

    const confirm = () => {
        if (!TERM_KEYS.every((key) => accepted[key])) {
            setShouldShowError(true);
            return;
        }
        submitWiseBusinessOnboarding(bankAccountID);
        Navigation.navigate(ROUTES.SETTINGS_WALLET_WISE_VERIFY_ADDITIONAL_INFO.getRoute(bankAccountID));
    };

    return (
        <ScreenWrapper
            testID="WiseAcceptTermsPage"
            includeSafeAreaPaddingBottom
        >
            <Header>
                <Header.BackButton onPress={() => Navigation.goBack()} />
                <Header.Title title={translate('walletPage.wiseOnboarding.terms.headerTitle')} />
            </Header>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
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
                        accessibilityLabel={translate(`walletPage.wiseOnboarding.terms.${key}AccessibilityLabel`)}
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
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WiseAcceptTermsPage;
