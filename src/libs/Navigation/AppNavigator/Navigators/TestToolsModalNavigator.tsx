import React, {useCallback, useRef} from 'react';
import type {MouseEvent} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import TestToolsModalPage from '@components/TestToolsModalPage';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
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
        // Release focus from any focused element before closing the modal
        blurActiveElement();
        requestAnimationFrame(() => {
            toggleTestToolsModal();
        });
    }, []);

    const handleInnerClick = useCallback((e: MouseEvent) => {
        e.stopPropagation();
    }, []);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => toggleTestToolsModal(), {shouldBubble: false});

    return (
        <NoDropZone>
            <Overlay />
            <PressableWithoutFeedback
                ref={outerViewRef}
                onPress={handleOuterClick}
                style={[styles.flex1, styles.alignItemsCenter, styles.getTestToolsNavigatorOuterView(shouldUseNarrowLayout)]}
                accessible={false}
            >
                <FocusTrapForScreens>
                    <View
                        onStartShouldSetResponder={() => true}
                        onClick={handleInnerClick}
                        style={styles.getTestToolsNavigatorInnerView(shouldUseNarrowLayout, isAuthenticated)}
                    >
                        <Stack.Navigator screenOptions={{headerShown: false}}>
                            <Stack.Screen
                                name={SCREENS.TEST_TOOLS_MODAL.ROOT}
                                component={TestToolsModalPage}
                            />
                        </Stack.Navigator>
                    </View>
                </FocusTrapForScreens>
            </PressableWithoutFeedback>
        </NoDropZone>
    );
}

export default TestToolsModalNavigator;
