import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderPageLayout from '@components/HeaderPageLayout';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {useCustomHistoryParam} from '@libs/Navigation/AppNavigator/customHistory';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DelegateMagicCodeModal from './DelegateMagicCodeModal';

type ConfirmDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function ConfirmDelegatePage({route}: ConfirmDelegatePageProps) {
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const login = route.params.login;
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const {isOffline} = useNetwork();
    const [shouldDisableModalAnimation, setShouldDisableModalAnimation] = useState(true);

    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useCustomHistoryParam();
    const [shouldShowLoading, setShouldShowLoading] = useState(isValidateCodeActionModalVisible ?? false);

    const personalDetails = getPersonalDetailByEmail(login);
    const avatarIcon = personalDetails?.avatar ?? FallbackAvatar;
    const formattedLogin = formatPhoneNumber(login ?? '');
    const displayName = personalDetails?.displayName ?? formattedLogin;

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    const submitButton = (
        <Button
            success
            isDisabled={isOffline}
            large
            text={translate('delegate.addCopilot')}
            style={styles.mt6}
            pressOnEnter
            onPress={() => {
                setShouldDisableModalAnimation(false);
                setIsValidateCodeActionModalVisible(true);
            }}
        />
    );

    return (
        <>
            <HeaderPageLayout
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(login, role))}
                title={translate('delegate.addCopilot')}
                testID={ConfirmDelegatePage.displayName}
                footer={submitButton}
                childrenContainerStyles={[styles.pt3, styles.gap6]}
                keyboardShouldPersistTaps="handled"
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <Text style={[styles.ph5]}>{translate('delegate.confirmCopilot')}</Text>
                    <MenuItem
                        avatarID={personalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        icon={avatarIcon}
                        title={displayName}
                        description={formattedLogin}
                        interactive={false}
                    />
                    <MenuItemWithTopDescription
                        title={translate('delegate.role', {role})}
                        description={translate('delegate.accessLevel')}
                        helperText={translate('delegate.roleDescription', {role})}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(login, role, ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(login, role)))}
                        shouldShowRightIcon
                    />
                    <DelegateMagicCodeModal
                        // We should disable the animation initially and only enable it when the user manually opens the modal
                        // to ensure it appears immediately when refreshing the page.
                        disableAnimation={shouldDisableModalAnimation}
                        login={login}
                        role={role}
                        onClose={() => {
                            setShouldShowLoading(false);
                            setIsValidateCodeActionModalVisible(false);
                        }}
                        isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}
                    />
                </DelegateNoAccessWrapper>
            </HeaderPageLayout>
            {shouldShowLoading && <FullScreenLoadingIndicator />}
        </>
    );
}

ConfirmDelegatePage.displayName = 'ConfirmDelegatePage';

export default ConfirmDelegatePage;
