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

type SelectDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE>;

function DelegateRoleSelectionListHeader() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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

function SelectDelegateRolePage({route}: SelectDelegateRolePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;

    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', {role}),
        alternateText: translate('delegate.roleDescription', {role}),
        isSelected: role === route.params.role,
        keyForList: role,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="SelectDelegateRolePage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('delegate.accessLevel')}
                    onBackButtonPress={() => Navigation.goBack(route.params?.backTo ?? ROUTES.SETTINGS_ADD_DELEGATE)}
                />
                <SelectionList
                    alternateNumberOfSupportedLines={4}
                    initiallyFocusedItemKey={roleOptions.find((role) => role.isSelected)?.keyForList}
                    shouldUpdateFocusedIndex
                    customListHeader={<DelegateRoleSelectionListHeader />}
                    onSelectRow={(option) => {
                        Navigation.setParams({
                            role: option.value,
                        });
                        Navigation.navigate(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(login, option.value));
                    }}
                    data={roleOptions}
                    ListItem={RadioListItem}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default SelectDelegateRolePage;
