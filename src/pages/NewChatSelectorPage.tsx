import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import CONST from '@src/CONST';
import NewChatPage from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';

function NewChatSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);

    const containerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element) as HTMLElement[];
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const onTabFocusTrapContainerElementChanged = useCallback((activeTabElement?: HTMLElement | null) => {
        setActiveTabContainerElement(activeTabElement ?? null);
    }, []);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{containerElements}}
        >
            <FocusTrapContainerElement onContainerElementChanged={setHeaderWithBackButtonContainerElement}>
                <View style={[styles.w100]}>
                    <HeaderWithBackButton
                        title={translate('sidebarScreen.fabNewChat')}
                        onBackButtonPress={navigation.goBack}
                    />
                </View>
            </FocusTrapContainerElement>

            <OnyxTabNavigator
                id={CONST.TAB.NEW_CHAT_TAB_ID}
                tabBar={TabSelector}
                onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                onActiveTabFocusTrapContainerElementChanged={onTabFocusTrapContainerElementChanged}
            >
                <TopTab.Screen name={CONST.TAB.NEW_CHAT}>
                    {() => (
                        <TabScreenWithFocusTrapWrapper>
                            <NewChatPage />
                        </TabScreenWithFocusTrapWrapper>
                    )}
                </TopTab.Screen>
                <TopTab.Screen name={CONST.TAB.NEW_ROOM}>
                    {() => (
                        <TabScreenWithFocusTrapWrapper>
                            <WorkspaceNewRoomPage />
                        </TabScreenWithFocusTrapWrapper>
                    )}
                </TopTab.Screen>
            </OnyxTabNavigator>
        </ScreenWrapper>
    );
}

NewChatSelectorPage.displayName = 'NewChatSelectorPage';

export default NewChatSelectorPage;
