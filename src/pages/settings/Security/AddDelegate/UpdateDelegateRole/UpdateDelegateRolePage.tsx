import type {StackScreenProps} from '@react-navigation/stack';
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
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type UpdateDelegateRolePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

function UpdateDelegateRolePage({route}: UpdateDelegateRolePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;

    const styles = useThemeStyles();
    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', role),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', role),
        isSelected: role === route.params.currentRole,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={UpdateDelegateRolePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('delegate.accessLevel')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList
                isAlternateTextMultilineSupported
                alternateTextNumberOfLines={4}
                initiallyFocusedOptionKey={route.params.currentRole}
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
                    Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_MAGIC_CODE.getRoute(login, option.value));
                }}
                sections={[{data: roleOptions}]}
                ListItem={RadioListItem}
            />
        </ScreenWrapper>
    );
}

UpdateDelegateRolePage.displayName = 'UpdateDelegateRolePage';

export default UpdateDelegateRolePage;
