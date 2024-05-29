import {useNavigation} from '@react-navigation/native';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import CONST from '@src/CONST';
import NewChatPage from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';

function NewChatSelectorPage() {
    const {translate} = useLocalize();
    const navigation = useNavigation();

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID={NewChatSelectorPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('sidebarScreen.fabNewChat')}
                onBackButtonPress={navigation.goBack}
            />
            <OnyxTabNavigator
                id={CONST.TAB.NEW_CHAT_TAB_ID}
                tabBar={TabSelector}
            >
                <TopTab.Screen
                    name={CONST.TAB.NEW_CHAT}
                    component={NewChatPage}
                />
                <TopTab.Screen
                    name={CONST.TAB.NEW_ROOM}
                    component={WorkspaceNewRoomPage}
                />
            </OnyxTabNavigator>
        </ScreenWrapper>
    );
}

NewChatSelectorPage.displayName = 'NewChatSelectorPage';

export default NewChatSelectorPage;
