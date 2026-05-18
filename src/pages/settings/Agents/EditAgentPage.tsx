import React from 'react';
import {View} from 'react-native';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAgentAvatarUpdateError, clearAgentNameUpdateError, clearAgentPromptUpdateError, deleteAgent} from '@libs/actions/Agent';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT>;

function EditAgentPage({route}: EditAgentPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const accountID = route.params.accountID;
    const [agent] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (list) => list?.[accountID]});
    const {showConfirmModal} = useConfirmModal();

    const handleBackPress = () => Navigation.goBack();
    const handleEditAvatarPress = () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT_AVATAR.getRoute(accountID));
    const handleEditNamePress = () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT_NAME.getRoute(accountID));
    const handleEditPromptPress = () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT_PROMPT.getRoute(accountID));
    const handleDeletePress = async () => {
        const result = await showConfirmModal({
            title: translate('editAgentPage.deleteAgentTitle'),
            prompt: translate('editAgentPage.deleteAgentMessage'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        deleteAgent(accountID);
    };

    return (
        <ScreenWrapper
            testID={EditAgentPage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('editAgentPage.title')}
                onBackButtonPress={handleBackPress}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <OfflineWithFeedback
                    errors={agent?.avatarErrors}
                    errorRowStyles={[styles.mh5, styles.mb2]}
                    onClose={() => clearAgentAvatarUpdateError(accountID)}
                >
                    <View style={[styles.alignItemsCenter, styles.pv5]}>
                        <AvatarButtonWithIcon
                            text={translate('editAgentAvatarPage.title')}
                            source={personalDetails?.avatar ?? ''}
                            avatarID={accountID}
                            onPress={handleEditAvatarPress}
                            size={CONST.AVATAR_SIZE.X_LARGE}
                            avatarStyle={[styles.avatarXLarge, styles.alignSelfCenter]}
                            pendingAction={personalDetails?.pendingFields?.avatar}
                            sentryLabel={CONST.SENTRY_LABEL.EDIT_AGENT_PAGE.AVATAR}
                            editIconStyle={styles.profilePageAvatar}
                        />
                    </View>
                </OfflineWithFeedback>
                <OfflineWithFeedback
                    errors={agent?.nameErrors}
                    errorRowStyles={[styles.mh5, styles.mb2]}
                    onClose={() => clearAgentNameUpdateError(accountID)}
                >
                    <MenuItemWithTopDescription
                        description={translate('editAgentPage.agentName')}
                        title={personalDetails?.displayName ?? ''}
                        shouldShowRightIcon
                        onPress={handleEditNamePress}
                    />
                </OfflineWithFeedback>
                <OfflineWithFeedback
                    errors={agent?.promptErrors}
                    errorRowStyles={[styles.mh5, styles.mb2]}
                    onClose={() => clearAgentPromptUpdateError(accountID)}
                >
                    <MenuItemWithTopDescription
                        description={translate('editAgentPage.instructions')}
                        title={agent?.prompt?.trim() ?? ''}
                        shouldShowRightIcon
                        onPress={handleEditPromptPress}
                        numberOfLinesTitle={10}
                    />
                </OfflineWithFeedback>
                <MenuItem
                    title={translate('editAgentPage.deleteAgent')}
                    icon={icons.Trashcan}
                    onPress={handleDeletePress}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

EditAgentPage.displayName = 'EditAgentPage';

export default EditAgentPage;
