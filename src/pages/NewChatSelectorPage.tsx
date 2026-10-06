import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setNewRoomFormLoading} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getPoliciesForRoomCreation} from '@libs/PolicyUtils';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import KeyboardUtils from '@src/utils/keyboard';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {WorkspaceNewRoomPageRef} from './workspace/WorkspaceNewRoomPage';

import NewChatPage from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';

function NewChatSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // The focus trap container elements of the header and back button, tab bar, and active tab
    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const [tabBarContainerElement, setTabBarContainerElement] = useState<HTMLElement | null>(null);
    const [activeTabContainerElement, setActiveTabContainerElement] = useState<HTMLElement | null>(null);
    const chatPageInputRef = useRef<AnimatedTextInputRef | null>(null);
    const roomPageInputRef = useRef<WorkspaceNewRoomPageRef | null>(null);

    // The Room tab is only useful when the user can create a room in at least one workspace.
    // Guests can only see policies where they cannot create rooms, so they get no Room tab.
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const canCreateRooms = useMemo(
        () => getPoliciesForRoomCreation(policies, session?.email).length > 0,
        [policies, session?.email],
    );

    // Theoretically, the focus trap container element can be null (due to component unmount/remount), so we filter out the null elements
    const containerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter((element) => !!element);
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);

    const onTabFocusTrapContainerElementChanged = useCallback((activeTabElement?: HTMLElement | null) => {
        setActiveTabContainerElement(activeTabElement ?? null);
    }, []);

    // We're focusing the input using internal onPageSelected to fix input focus inconsistencies.
    // More info: https://github.com/Expensify/App/issues/59388
    const onTabSelectFocusHandler = ({index}: {index: number}) => {
        // We requestAnimationFrame since the function is called in the animate block in the web implementation
        // which fixes a locked animation glitch when swiping between tabs, and aligns with the native implementation internal delay
        requestAnimationFrame(() => {
            // Chat tab (0) / Room tab (1) according to OnyxTabNavigator (see below)
            if (index === 0) {
                chatPageInputRef.current?.focus();
            } else if (index === 1) {
                if (roomPageInputRef.current?.isValidInput?.()) {
                    roomPageInputRef.current?.focus?.();
                } else {
                    KeyboardUtils.dismiss();
                }
            }
        });
    };

    const navigateBack = () => {
        Navigation.closeRHPFlow();
    };

    useEffect(() => {
        setNewRoomFormLoading(false);
    }, []);

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableKeyboardAvoidingView={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID="NewChatSelectorPage"
            focusTrapSettings={{containerElements}}
        >
            <FocusTrapContainerElement
                onContainerElementChanged={setHeaderWithBackButtonContainerElement}
                style={[styles.w100]}
            >
                <HeaderWithBackButton
                    title={translate('sidebarScreen.fabNewChat')}
                    onBackButtonPress={navigateBack}
                />
            </FocusTrapContainerElement>

            <OnyxTabNavigator
                id={CONST.TAB.NEW_CHAT_TAB_ID}
                tabBar={TabSelector}
                onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement}
                onActiveTabFocusTrapContainerElementChanged={onTabFocusTrapContainerElementChanged}
                onTabSelect={onTabSelectFocusHandler}
            >
                <TopTab.Screen name={CONST.TAB.NEW_CHAT}>
                    {() => (
                        <TabScreenWithFocusTrapWrapper>
                            <NewChatPage ref={chatPageInputRef} />
                        </TabScreenWithFocusTrapWrapper>
                    )}
                </TopTab.Screen>
                {canCreateRooms && (
                    <TopTab.Screen name={CONST.TAB.NEW_ROOM}>
                        {() => (
                            <TabScreenWithFocusTrapWrapper>
                                <WorkspaceNewRoomPage ref={roomPageInputRef} />
                            </TabScreenWithFocusTrapWrapper>
                        )}
                    </TopTab.Screen>
                )}
            </OnyxTabNavigator>
        </ScreenWrapper>
    );
}

export default NewChatSelectorPage;
