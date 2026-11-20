import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useVerifyAccountAndResume from '@hooks/useVerifyAccountAndResume';

import {updateDelegateRole} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DelegateRole} from '@src/types/onyx/Account';

import {delegatesSelector} from '@selectors/Account';
import React from 'react';

type UpdateDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

function UpdateDelegateRoleSelectionListHeader() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Text style={[styles.ph5, styles.pb5, styles.pt3]}>
            <>
                {translate('delegate.accessLevelDescription')}{' '}
                <TextLink
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SECURITY.DELEGATE_CHANGE_ACCESS_LEARN_MORE_LINK}
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
    const [delegatedAccess] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegatesSelector});
    const {currentRole, login} = route.params;
    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume((resumeChangeRole?: () => void) => resumeChangeRole?.());

    const currentDelegate = delegatedAccess?.delegates?.find((d) => d.email === login);
    const matchingRole = currentDelegate?.role ?? currentRole;

    const changeRole = (role: DelegateRole) => {
        // Reducing access does not require an action code once the owner's account is validated.
        if (matchingRole === CONST.DELEGATE_ROLE.ALL && role === CONST.DELEGATE_ROLE.SUBMITTER) {
            updateDelegateRole({
                email: login,
                role,
                delegatedAccess,
                validateCode: undefined,
            });
            Navigation.goBack(ROUTES.SETTINGS_COPILOT);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE.getRoute(login, role));
    };

    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', role),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', role),
        isSelected: role === matchingRole,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="UpdateDelegateRolePage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('delegate.accessLevel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SelectionList
                    alternateNumberOfSupportedLines={4}
                    initiallyFocusedItemKey={matchingRole}
                    shouldUpdateFocusedIndex
                    customListHeader={<UpdateDelegateRoleSelectionListHeader />}
                    onSelectRow={(option) => {
                        if (!option.value || option.isSelected) {
                            Navigation.dismissModal();
                            return;
                        }
                        // Creating a personal agent can grant copilot access before its owner validates their account.
                        if (!isUserValidated) {
                            verifyAccountAndResume(() => changeRole(option.value));
                            return;
                        }
                        changeRole(option.value);
                    }}
                    data={roleOptions}
                    ListItem={SingleSelectListItem}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default UpdateDelegateRolePage;
