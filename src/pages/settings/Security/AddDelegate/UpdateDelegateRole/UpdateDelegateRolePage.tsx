import React, {useEffect, useState} from 'react';
import type {ValueOf} from 'type-fest';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDelegateRolePendingAction, updateDelegateRoleOptimistically} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {DelegateRole} from '@src/types/onyx/Account';
import UpdateDelegateMagicCodeModal from './UpdateDelegateMagicCodeModal';

type UpdateDelegateRolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

function UpdateDelegateRolePage({route}: UpdateDelegateRolePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;
    const currentRole = route.params.currentRole;
    const showValidateActionModalFromURL = route.params.showValidateActionModal === 'true';
    const newRoleFromURL = route.params.newRole;
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(showValidateActionModalFromURL ?? false);
    const [newRole, setNewRole] = useState<ValueOf<typeof CONST.DELEGATE_ROLE> | undefined>(newRoleFromURL);
    const [shouldShowLoading, setShouldShowLoading] = useState(showValidateActionModalFromURL ?? false);

    useEffect(() => {
        Navigation.setParams({showValidateActionModal: isValidateCodeActionModalVisible, newRole});
    }, [isValidateCodeActionModalVisible, newRole]);

    const styles = useThemeStyles();
    const roleOptions = Object.values(CONST.DELEGATE_ROLE).map((role) => ({
        value: role,
        text: translate('delegate.role', {role}),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', {role}),
        isSelected: role === currentRole,
    }));

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));
    useEffect(() => {
        updateDelegateRoleOptimistically(login ?? '', currentRole as DelegateRole);
        return () => clearDelegateRolePendingAction(login);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [login]);

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
                        setNewRole(option?.value);
                        setIsValidateCodeActionModalVisible(true);
                    }}
                    sections={[{data: roleOptions}]}
                    ListItem={RadioListItem}
                />
                {!!newRole && (
                    <UpdateDelegateMagicCodeModal
                        login={login}
                        role={newRole}
                        isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}
                        onClose={() => {
                            setShouldShowLoading(false);
                            setIsValidateCodeActionModalVisible(false);
                        }}
                    />
                )}
            </DelegateNoAccessWrapper>
            {shouldShowLoading && <FullScreenLoadingIndicator />}
        </ScreenWrapper>
    );
}

UpdateDelegateRolePage.displayName = 'UpdateDelegateRolePage';

export default UpdateDelegateRolePage;
