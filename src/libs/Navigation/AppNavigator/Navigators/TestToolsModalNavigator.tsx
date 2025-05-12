import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import TestToolsModalPage from '@components/TestToolsModalPage';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {TestToolsModalModalNavigatorParamList} from '@libs/Navigation/types';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const Stack = createPlatformStackNavigator<TestToolsModalModalNavigatorParamList>();

function TestToolsModalNavigator() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const outerViewRef = useRef<View>(null);
    const isAuthenticated = useIsAuthenticated();

    const handleOuterClick = useCallback(() => {
        toggleTestToolsModal();
    }, []);

    const handleInnerPress = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
    }, []);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleOuterClick, {shouldBubble: true});

    return (
        <NoDropZone>
            <Overlay />
            <View
                ref={outerViewRef}
                onClick={handleOuterClick}
                onTouchEnd={handleOuterClick}
                style={styles.TestToolsNavigatorOuterView(shouldUseNarrowLayout)}
            >
                <FocusTrapForScreens>
                    <View
                        onClick={(e) => e.stopPropagation()}
                        onTouchEnd={handleInnerPress}
                        style={styles.TestToolsNavigatorInnerView(shouldUseNarrowLayout, isAuthenticated)}
                    >
                        <Stack.Navigator screenOptions={{headerShown: false}}>
                            <Stack.Screen
                                name={SCREENS.TEST_TOOLS_MODAL.ROOT}
                                component={TestToolsModalPage}
                            />
                        </Stack.Navigator>
                    </View>
                </FocusTrapForScreens>
            </View>
        </NoDropZone>
    );
}

TestToolsModalNavigator.displayName = 'TestToolsModalNavigator';

export default TestToolsModalNavigator;
