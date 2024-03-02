import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import CONST from '@src/CONST';
import NewChatPage from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';
import useLocalize from '@hooks/useLocalize';


function NewChatSelectorPage() {
    const {translate} = useLocalize();
    return (
        <ScreenWrapper 
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID={NewChatSelectorPage.displayName}
        >
            <HeaderWithBackButton title={translate('sidebarScreen.fabNewChat')} />
            <OnyxTabNavigator
                id={CONST.TAB.NEW_CHAT_TAB_ID}
                tabBar={({state, navigation, position}) => (
                    <TabSelector
                        state={state}
                        navigation={navigation}
                        position={position}
                    />
                )}
            >
                <TopTab.Screen
                    name={CONST.TAB.NEW_CHAT}
                    // @ts-expect-error TODO: 'isGroupChat' is declared here.
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

export default NewChatSelectorPage
