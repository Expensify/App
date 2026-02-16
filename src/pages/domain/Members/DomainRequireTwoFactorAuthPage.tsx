import {domainMemberSettingsSelector, domainNameSelector} from '@selectors/Domain';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TwoFactorAuthForm from '@components/TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from '@components/TwoFactorAuthForm/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {clearToggleTwoFactorAuthRequiredForDomainError, toggleTwoFactorAuthRequiredForDomain} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type DomainRequireTwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS_SETTINGS_TWO_FACTOR_AUTH>;

function DomainRequireTwoFactorAuthPage({route}: DomainRequireTwoFactorAuthPageProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: domainNameSelector});
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: domainMemberSettingsSelector,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
    });

    const baseTwoFactorAuthRef = useRef<BaseTwoFactorAuthFormRef>(null);

    useEffect(() => {
        if (domainSettings?.twoFactorAuthRequired) {
            return;
        }
        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
    }, [domainAccountID, domainSettings?.twoFactorAuthRequired]);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={DomainRequireTwoFactorAuthPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('twoFactorAuth.disableTwoFactorAuth')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(domainAccountID));
                    }}
                    shouldDisplayHelpButton={false}
                />

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.flexGrow1}
                >
                    <View style={[styles.mh5, styles.mb4, styles.mt3]}>
                        <TwoFactorAuthForm
                            ref={baseTwoFactorAuthRef}
                            shouldAllowRecoveryCode
                            onSubmit={(code: string) => {
                                if (!domainName) {
                                    return;
                                }

                                toggleTwoFactorAuthRequiredForDomain(domainAccountID, domainName, false, code);
                            }}
                            shouldAutoFocus={false}
                            onInputChange={() => {
                                if (isEmptyObject(domainErrors?.setTwoFactorAuthRequiredError)) {
                                    return;
                                }
                                clearToggleTwoFactorAuthRequiredForDomainError(domainAccountID);
                            }}
                            errorMessage={getLatestErrorMessage({errors: domainErrors?.setTwoFactorAuthRequiredError})}
                        />
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mt2, styles.pt2]}>
                    <Button
                        success
                        large
                        text={translate('common.disable')}
                        isLoading={!isEmptyObject(domainPendingActions?.twoFactorAuthRequired)}
                        onPress={() => baseTwoFactorAuthRef.current?.validateAndSubmitForm()}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainRequireTwoFactorAuthPage.displayName = 'DomainRequireTwoFactorAuthPage';

export default DomainRequireTwoFactorAuthPage;
