import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ConfirmDelegatePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function ConfirmDelegatePage({route}: ConfirmDelegatePageProps) {
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const accountID = Number(route.params.accountID);

    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([accountID], -1)[0];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ConfirmDelegatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('delegate.addCopilot')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text style={[styles.ph5, styles.pt3]}>{translate('delegate.confirmCopilot')}</Text>
            <MenuItem
                avatarID={route.params.accountID}
                icon={personalDetails.avatar ?? ''}
                iconType={CONST.ICON_TYPE_AVATAR}
                title={personalDetails.displayName ?? personalDetails.login}
                description={personalDetails.login}
                interactive={false}
                style={styles.mv6}
            />
            <MenuItemWithTopDescription
                title={translate('delegate.role', route.params.role)}
                description={translate('delegate.accessLevel')}
                helperText={translate('delegate.roleDescription', route.params.role)}
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute(accountID, route.params.role))}
                shouldShowRightIcon
            />
        </ScreenWrapper>
    );
}

ConfirmDelegatePage.displayName = 'ConfirmDelegatePage';

export default ConfirmDelegatePage;
