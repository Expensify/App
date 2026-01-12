import {domainNameSelector} from '@selectors/Domain';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidRecoveryCode, isValidTwoFactorCode} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
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
    const recoveryInputRef = useRef<BaseTextInputRef | null>(null);
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string; recoveryCode?: string}>({});
    const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);

    const validateAndSubmitForm = () => {
        const config = isUsingRecoveryCode
            ? {
                  codeInputRef: recoveryInputRef,
                  code: recoveryCode,
                  errorKey: 'recoveryCode',
                  validate: isValidRecoveryCode,
                  errors: {
                      empty: 'recoveryCodeForm.error.pleaseFillRecoveryCode',
                      invalid: 'recoveryCodeForm.error.incorrectRecoveryCode',
                  },
              }
            : {
                  codeInputRef: inputRef,
                  code: twoFactorAuthCode,
                  errorKey: 'twoFactorAuthCode',
                  validate: isValidTwoFactorCode,
                  errors: {
                      empty: 'twoFactorAuthForm.error.pleaseFillTwoFactorAuth',
                      invalid: 'twoFactorAuthForm.error.incorrect2fa',
                  },
              };

        if (config.codeInputRef.current && typeof config.codeInputRef.current.blur === 'function') {
            config.codeInputRef.current.blur();
        }

        const sanitizedCode = config.code.trim();
        if (!sanitizedCode) {
            setFormError({[config.errorKey]: translate(config.errors.empty as TranslationPaths)});
            return;
        }

        if (!config.validate(sanitizedCode)) {
            setFormError({[config.errorKey]: translate(config.errors.invalid as TranslationPaths)});
            return;
        }

        setFormError({});

        if (!domainName) {
            return;
        }

        toggleTwoFactorAuthRequiredForDomain(domainAccountID, domainName, false, sanitizedCode);
        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
    };

    const handleToggleInputType = () => {
        setIsUsingRecoveryCode((prev) => {
            const nextValue = !prev;
            if (nextValue) {
                setTwoFactorAuthCode('');
            } else {
                setRecoveryCode('');
            }
            return nextValue;
        });

        setFormError({});
    };

    const onRecoveryCodeInput = (text: string) => {
        setRecoveryCode(text);
        setFormError((prev) => ({...prev, recoveryCode: undefined}));
    };

    const toggleLabelKey = isUsingRecoveryCode ? 'recoveryCodeForm.use2fa' : 'recoveryCodeForm.useRecoveryCode';

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={DomainRequireTwoFactorAuthPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.members.disableTwoFactorAuth')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
                    }}
                />

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.flexGrow1}
                >
                    <View style={[styles.mh5]}>
                        <Text style={[styles.mb3]}>{translate(isUsingRecoveryCode ? 'twoFactorAuth.explainProcessToRemoveWithRecovery' : 'twoFactorAuth.explainProcessToRemove')}</Text>

                        {isUsingRecoveryCode ? (
                            <TextInput
                                ref={(input) => {
                                    recoveryInputRef.current = input;
                                }}
                                value={recoveryCode}
                                onChangeText={onRecoveryCodeInput}
                                autoFocus={false}
                                autoCapitalize="characters"
                                label={translate('recoveryCodeForm.recoveryCode')}
                                maxLength={CONST.FORM_CHARACTER_LIMIT}
                                errorText={formError.recoveryCode}
                                onSubmitEditing={validateAndSubmitForm}
                                accessibilityLabel={translate('recoveryCodeForm.recoveryCode')}
                                role={CONST.ROLE.PRESENTATION}
                                testID="recoveryCodeInput"
                            />
                        ) : (
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
                        )}
                        <PressableWithFeedback
                            style={[styles.mt2]}
                            onPress={handleToggleInputType}
                            hoverDimmingValue={1}
                            accessibilityLabel={translate(toggleLabelKey)}
                        >
                            <Text style={[styles.link]}>{translate(toggleLabelKey)}</Text>
                        </PressableWithFeedback>
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mt2, styles.pt2]}>
                    <Button
                        success
                        large
                        text={translate('common.disable')}
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
