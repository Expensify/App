import React from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderPageLayout from '@components/HeaderPageLayout';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ConfirmDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function ConfirmDelegatePage({route}: ConfirmDelegatePageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {translate, formatPhoneNumber} = useLocalize();

    const styles = useThemeStyles();
    const login = route.params.login;
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const {isOffline} = useNetwork();

    const personalDetails = getPersonalDetailByEmail(login);
    const avatarIcon = personalDetails?.avatar ?? icons.FallbackAvatar;
    const formattedLogin = formatPhoneNumber(login ?? '');
    const displayName = personalDetails?.displayName ?? formattedLogin;

    const submitButton = (
        <Button
            success
            isDisabled={isOffline}
            large
            text={translate('delegate.addCopilot')}
            style={styles.mt6}
            pressOnEnter
            onPress={() => {
                Navigation.navigate(ROUTES.SETTINGS_DELEGATE_CONFIRM_MAGIC_CODE.getRoute(login, role));
            }}
        />
    );

    return (
        <HeaderPageLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(login, role))}
            title={translate('delegate.addCopilot')}
            testID="ConfirmDelegatePage"
            footer={submitButton}
            childrenContainerStyles={[styles.pt3, styles.gap6]}
            keyboardShouldPersistTaps="handled"
            shouldShowOfflineIndicatorInWideScreen
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <Text style={styles.ph5}>{translate('delegate.confirmCopilot')}</Text>
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
            </DelegateNoAccessWrapper>
        </HeaderPageLayout>
    );
}

export default ConfirmDelegatePage;
