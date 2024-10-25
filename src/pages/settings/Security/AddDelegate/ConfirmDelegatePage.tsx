import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DelegateMagicCodeModal from './DelegateMagicCodeModal';

type ConfirmDelegatePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function ConfirmDelegatePage({route}: ConfirmDelegatePageProps) {
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const login = route.params.login;
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const showValidateActionModal = route.params.showValidateActionModal === 'true';
    const {isOffline} = useNetwork();

    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(showValidateActionModal ?? false);

    const personalDetails = PersonalDetailsUtils.getPersonalDetailByEmail(login);
    const avatarIcon = personalDetails?.avatar ?? FallbackAvatar;
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
            onPress={() => setIsValidateCodeActionModalVisible(true)}
        />
    );

    return (
        <HeaderPageLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(login, role))}
            title={translate('delegate.addCopilot')}
            testID={ConfirmDelegatePage.displayName}
            footer={submitButton}
            childrenContainerStyles={[styles.pt3, styles.gap6]}
        >
            <Text style={[styles.ph5]}>{translate('delegate.confirmCopilot')}</Text>
            <MenuItem
                avatarID={personalDetails?.accountID ?? -1}
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
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(login, role))}
                shouldShowRightIcon
            />

            {isValidateCodeActionModalVisible && (
                <DelegateMagicCodeModal
                    login={login}
                    role={role}
                    onClose={() => {
                        if (!showValidateActionModal) {
                            return;
                        }

                        Navigation.navigate(ROUTES.SETTINGS_SECURITY);
                    }}
                />
            )}
        </HeaderPageLayout>
    );
}

ConfirmDelegatePage.displayName = 'ConfirmDelegatePage';

export default ConfirmDelegatePage;
