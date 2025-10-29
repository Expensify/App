import React from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
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

type UpdateDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

function UpdateDelegateRoleSelectionListHeader() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
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
    );
}

function UpdateDelegateRolePage({route}: UpdateDelegateRolePageProps) {
    const {translate} = useLocalize();
    const {currentRole, login} = route.params;

    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', {role}),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', {role}),
        isSelected: role === currentRole,
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
                    alternateNumberOfSupportedLines={4}
                    initiallyFocusedItemKey={currentRole}
                    shouldUpdateFocusedIndex
                    customListHeader={<UpdateDelegateRoleSelectionListHeader />}
                    onSelectRow={(option) => {
                        if (!option.value || option.isSelected) {
                            Navigation.dismissModal();
                            return;
                        }
                        Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE.getRoute(login, option?.value));
                    }}
                    data={roleOptions}
                    ListItem={RadioListItem}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

UpdateDelegateRolePage.displayName = 'UpdateDelegateRolePage';

export default UpdateDelegateRolePage;
