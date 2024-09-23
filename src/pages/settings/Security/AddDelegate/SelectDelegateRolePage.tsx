import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SelectDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE>;

function SelectDelegateRolePage({route}: SelectDelegateRolePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;

    const styles = useThemeStyles();
    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', role),
        alternateText: translate('delegate.roleDescription', role),
        isSelected: role === route.params.role,
        keyForList: role,
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
                isAlternateTextMultilineSupported
                alternateTextNumberOfLines={4}
                initiallyFocusedOptionKey={roleOptions.find((role) => role.isSelected)?.keyForList}
                shouldUpdateFocusedIndex
                headerContent={
                    <Text style={[styles.ph5, styles.pb5, styles.pt3]}>
                        <>
                            {translate('delegate.accessLevelDescription')}{' '}
                            <TextLink
                                style={[styles.link]}
                                href={CONST.COPILOT_HELP_URL}
                            >
                                {translate('common.learnMore')}
                            </TextLink>
                        </>
                    </Text>
                }
                onSelectRow={(option) => {
                    Navigation.navigate(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(login, option.value));
                }}
                sections={[{data: roleOptions}]}
                ListItem={RadioListItem}
            />
        </ScreenWrapper>
    );
}

SelectDelegateRolePage.displayName = 'SelectDelegateRolePage';

export default SelectDelegateRolePage;
