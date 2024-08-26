import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderPageLayout from '@components/HeaderPageLayout';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addDelegate} from '@libs/actions/Delegate';
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
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;

    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([accountID], -1)[0];

    const submitButton = (
        <Button
            success
            large
            text={translate('delegate.addCopilot')}
            style={styles.mt6}
            pressOnEnter
            onPress={() => {
                addDelegate(personalDetails.login ?? '', role);
                Navigation.dismissModal();
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
                icon={personalDetails.avatar ?? ''}
                iconType={CONST.ICON_TYPE_AVATAR}
                title={personalDetails.displayName ?? personalDetails.login}
                description={personalDetails.login}
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
