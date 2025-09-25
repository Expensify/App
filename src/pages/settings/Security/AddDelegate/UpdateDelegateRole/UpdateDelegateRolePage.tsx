import React from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type UpdateDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

function UpdateDelegateRolePage({route}: UpdateDelegateRolePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;
    const selectedRole = route.params.currentRole;

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);

    const styles = useThemeStyles();
    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', {role}),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', {role}),
        isSelected: role === selectedRole,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={UpdateDelegateRolePage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('delegate.accessLevel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SelectionList
                    isAlternateTextMultilineSupported
                    alternateTextNumberOfLines={4}
                    initiallyFocusedOptionKey={selectedRole}
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
                                .
                            </>
                        </Text>
                    }
                    onSelectRow={(option) => {
                        if (!option?.value || option?.value === currentDelegate?.role) {
                            Navigation.dismissModal();
                            return;
                        }
                        Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE.getRoute(login, option?.value));
                    }}
                    sections={[{data: roleOptions}]}
                    ListItem={RadioListItem}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

UpdateDelegateRolePage.displayName = 'UpdateDelegateRolePage';

export default UpdateDelegateRolePage;
