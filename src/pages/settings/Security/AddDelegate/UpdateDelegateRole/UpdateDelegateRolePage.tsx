import React, {useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDelegateRolePendingAction, requestValidationCode, updateDelegateRoleOptimistically} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DelegateRole} from '@src/types/onyx/Account';

type UpdateDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

function UpdateDelegateRolePage({route}: UpdateDelegateRolePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;
    const [currentRole, setCurrentRole] = useState(route.params.currentRole);

    const styles = useThemeStyles();
    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', {role}),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', {role}),
        isSelected: role === currentRole,
    }));

    useEffect(() => {
        updateDelegateRoleOptimistically(login ?? '', currentRole as DelegateRole);
        return () => clearDelegateRolePendingAction(login);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [login]);

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
                initiallyFocusedOptionKey={currentRole}
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
                    if (option.isSelected) {
                        Navigation.dismissModal();
                        return;
                    }

                    requestValidationCode();
                    setCurrentRole(option.value);
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
