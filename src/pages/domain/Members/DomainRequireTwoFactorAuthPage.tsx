import {domainNameSelector} from '@selectors/Domain';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidTwoFactorCode} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainRequireTwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_SETTINGS_TWO_FACTOR_AUTH>;

function DomainRequireTwoFactorAuthPage({route}: DomainRequireTwoFactorAuthPageProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});

    const inputRef = useRef<MagicCodeInputHandle | null>(null);
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string; recoveryCode?: string}>({});

    const validateAndSubmitForm = () => {
        const sanitizedTwoFactorCode = twoFactorAuthCode.trim();
        if (!sanitizedTwoFactorCode) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth')});
            return;
        }

        if (!isValidTwoFactorCode(sanitizedTwoFactorCode)) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa')});
            return;
        }

        setFormError({});

        if (!domainName) {
            return;
        }
        toggleTwoFactorAuthRequiredForDomain(domainAccountID, domainName, false, sanitizedTwoFactorCode);
        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={DomainRequireTwoFactorAuthPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('common.verify')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
                    }}
                />

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.flexGrow1}
                >
                    <View style={[styles.mh5]}>
                        <Text style={styles.mb5}>{translate('domain.members.enterTwoFactorAuthCodeDescription')}</Text>
                        <MagicCodeInput
                            autoComplete={'one-time-code' /** "sms-otp" */}
                            name="twoFactorAuthCode"
                            value={twoFactorAuthCode}
                            onChangeText={setTwoFactorAuthCode}
                            onFulfill={validateAndSubmitForm}
                            errorText={formError.twoFactorAuthCode}
                            ref={inputRef}
                            autoFocus={false}
                            testID="twoFactorAuthCodeInput"
                        />
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mt2, styles.pt2]}>
                    <Button
                        success
                        large
                        text={translate('common.verify')}
                        isLoading={account?.isLoading}
                        onPress={validateAndSubmitForm}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainRequireTwoFactorAuthPage.displayName = 'DomainRequireTwoFactorAuthPage';

export default DomainRequireTwoFactorAuthPage;
