import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
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
import {requestValidationCode} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ConfirmDelegatePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function ConfirmDelegatePage({route}: ConfirmDelegatePageProps) {
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const accountID = Number(route.params.accountID);
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const {isOffline} = useNetwork();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([accountID], -1)[0];

    const optimisticDelegateEmail = account?.delegatedAccess?.delegates?.find((delegate) => delegate.optimisticAccountID === accountID)?.email;
    const optimisticDelegateData = OptionsListUtils.getUserToInviteOption({
        searchValue: optimisticDelegateEmail ?? '',
    });

    const avatarIcon = personalDetails?.avatar ?? FallbackAvatar;
    const login = personalDetails?.login ?? optimisticDelegateData?.login;
    const displayName = personalDetails?.displayName ?? login;

    const submitButton = (
        <Button
            success
            isDisabled={isOffline}
            large
            text={translate('delegate.addCopilot')}
            style={styles.mt6}
            pressOnEnter
            onPress={() => {
                requestValidationCode();
                Navigation.navigate(ROUTES.SETTINGS_DELEGATE_MAGIC_CODE.getRoute(accountID, role));
            }}
        />
    );

    return (
        <HeaderPageLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(accountID, role))}
            title={translate('delegate.addCopilot')}
            testID={ConfirmDelegatePage.displayName}
            footer={submitButton}
            childrenContainerStyles={[styles.pt3, styles.gap6]}
        >
            <Text style={[styles.ph5]}>{translate('delegate.confirmCopilot')}</Text>
            <MenuItem
                avatarID={route.params.accountID}
                iconType={CONST.ICON_TYPE_AVATAR}
                icon={avatarIcon}
                title={displayName}
                description={login}
                interactive={false}
            />
            <MenuItemWithTopDescription
                title={translate('delegate.role', role)}
                description={translate('delegate.accessLevel')}
                helperText={translate('delegate.roleDescription', role)}
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(accountID, role))}
                shouldShowRightIcon
            />
        </HeaderPageLayout>
    );
}

ConfirmDelegatePage.displayName = 'ConfirmDelegatePage';

export default ConfirmDelegatePage;
