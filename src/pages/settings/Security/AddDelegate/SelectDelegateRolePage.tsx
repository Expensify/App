import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SelectDelegateRolePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE>;

function SelectDelegateRolePage({route}: SelectDelegateRolePageProps) {
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', role),
        keyForList: role,
        isSelected: role === route.params.role,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={SelectDelegateRolePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('delegate.accessLevel')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ADD_DELEGATE)}
            />
            <SelectionList
                headerContent={<Text style={[styles.ph5, styles.pb5, styles.pt3]}>{translate('delegate.accessLevelDescription')}</Text>}
                onSelectRow={(option) => {
                    Navigation.navigate(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(Number(route.params.accountID), option.value));
                }}
                sections={[{data: roleOptions}]}
                ListItem={RadioListItem}
            />
        </ScreenWrapper>
    );
}

SelectDelegateRolePage.displayName = 'SelectDelegateRolePage';

export default SelectDelegateRolePage;
