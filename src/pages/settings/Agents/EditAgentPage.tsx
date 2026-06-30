import {Str} from 'expensify-common';
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
import useChatWithAgent from '@hooks/useChatWithAgent';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSwitchToDelegator from '@hooks/useSwitchToDelegator';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAgentAvatarUpdateError, clearAgentNameUpdateError, clearAgentPromptUpdateError, deleteAgent} from '@libs/actions/Agent';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type EditAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT>;

function EditAgentPage({route}: EditAgentPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan', 'ChatBubble', 'Users']);
    const accountID = route.params.accountID;
    const [agent, agentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`);
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (list) => list?.[accountID]});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {showConfirmModal} = useConfirmModal();
    const chatWithAgent = useChatWithAgent();
    const switchToDelegator = useSwitchToDelegator();
    const isOnyxLoaded = agentMetadata.status === 'loaded' && personalDetailsMetadata.status === 'loaded';
    const shouldShowNotFoundPage = isOnyxLoaded && !agent && !personalDetails;

    const agentLogin = personalDetails?.login ?? '';
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
            shouldHandleNavigationBack: false,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        deleteAgent(accountID, agentLogin, allPolicies);
    };
    const isPendingAddOrDelete = agent?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || agent?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const areActionsDisabled = isPendingAddOrDelete || accountID <= 0 || !agentLogin;
    const handleChatPress = () => {
        chatWithAgent(accountID);
    };
    const handleCopilotPress = () => {
        switchToDelegator(agentLogin);
    };

    if (shouldShowNotFoundPage) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_AGENTS)} />;
    }

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
                            size={CONST.AVATAR_SIZE.XXXXX_LARGE}
                            avatarStyle={[styles.avatarXxxxxLarge, styles.alignSelfCenter]}
                            pendingAction={personalDetails?.pendingFields?.avatar}
                            sentryLabel={CONST.SENTRY_LABEL.EDIT_AGENT_PAGE.AVATAR}
                            editIconStyle={styles.smallEditIconAccount}
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
                        title={Str.htmlDecode(agent?.prompt?.trim() ?? '')}
                        shouldParseTitle
                        shouldTruncateTitle
                        characterLimit={CONST.AGENT_PROMPT_LIMIT}
                        shouldShowRightIcon
                        onPress={handleEditPromptPress}
                    />
                </OfflineWithFeedback>
                <MenuItem
                    title={translate('editAgentPage.chatWithAgent')}
                    icon={icons.ChatBubble}
                    onPress={handleChatPress}
                    disabled={areActionsDisabled}
                />
                <MenuItem
                    title={translate('editAgentPage.copilotIntoAccount')}
                    icon={icons.Users}
                    onPress={handleCopilotPress}
                    disabled={areActionsDisabled}
                />
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
