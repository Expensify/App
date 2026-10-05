import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import TestToolsModalPage from '@components/TestToolsModalPage';
import TestToolsServerPage from '@components/TestToolsServerPage';

import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useRequire2FAOverlayVisibility, {REQUIRE_2FA_ABOVE_PORTAL_HOST} from '@hooks/useRequire2FAOverlayVisibility';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TestToolsModalModalNavigatorParamList} from '@libs/Navigation/types';

import toggleTestToolsModal from '@userActions/TestTool';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import type {ComponentRef, ComponentType, MouseEvent, ReactNode} from 'react';

import {Portal} from '@gorhom/portal';
import {NavigationContext, NavigationRouteContext, useIsFocused} from '@react-navigation/native';
import {CardAnimationContext} from '@react-navigation/stack';
import React, {useCallback, useContext, useRef} from 'react';
import {View} from 'react-native';

import Overlay from './Overlay';

const Stack = createPlatformStackNavigator<TestToolsModalModalNavigatorParamList>();

type TestToolsRouteName = keyof TestToolsModalModalNavigatorParamList;

type TestToolsModalFrameProps = {
    children: ReactNode;
};

function TestToolsModalFrame({children}: TestToolsModalFrameProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const outerViewRef = useRef<ComponentRef<typeof View>>(null);
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

    return (
        <NoDropZone>
            <Overlay />
            <PressableWithoutFeedback
                ref={outerViewRef}
                onPress={handleOuterClick}
                sentryLabel="TestToolsModalNavigator-Dismiss"
                style={[styles.flex1, styles.alignItemsCenter, styles.getTestToolsNavigatorOuterView(shouldUseNarrowLayout)]}
                accessible={false}
            >
                <FocusTrapForScreens>
                    <View
                        onStartShouldSetResponder={() => true}
                        onClick={handleInnerClick}
                        style={styles.getTestToolsNavigatorInnerView(shouldUseNarrowLayout, isAuthenticated)}
                    >
                        {children}
                    </View>
                </FocusTrapForScreens>
            </PressableWithoutFeedback>
        </NoDropZone>
    );
}

/**
 * While the required-2FA overlay covers the root stack, draw this screen in the portal host above it.
 * The nested stack stays in the root navigator so the URL, backTo, and goBack keep working.
 * The host is outside that stack, so the frame gets the screen contexts it reads.
 */
function withRequire2FAPortal<RouteName extends TestToolsRouteName>(Screen: ComponentType<PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, RouteName>>) {
    function Require2FAPortaledTestToolsScreen(props: PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, RouteName>) {
        const {isRequire2FAOverlayVisible} = useRequire2FAOverlayVisibility();
        const navigation = useContext(NavigationContext);
        const route = useContext(NavigationRouteContext);
        const cardAnimation = useContext(CardAnimationContext);
        const isFocused = useIsFocused();

        if (!isRequire2FAOverlayVisible) {
            return <Screen {...props} />;
        }

        // A stack keeps the previous screen mounted. Only the focused one should cover the 2FA screen.
        if (!isFocused || !navigation || !route) {
            return null;
        }

        const screenFrame = (
            <TestToolsModalFrame>
                <Screen {...props} />
            </TestToolsModalFrame>
        );
        const frame = cardAnimation ? <CardAnimationContext.Provider value={cardAnimation}>{screenFrame}</CardAnimationContext.Provider> : screenFrame;

        return (
            <Portal hostName={REQUIRE_2FA_ABOVE_PORTAL_HOST}>
                <NavigationContext.Provider value={navigation}>
                    <NavigationRouteContext.Provider value={route}>{frame}</NavigationRouteContext.Provider>
                </NavigationContext.Provider>
            </Portal>
        );
    }

    return Require2FAPortaledTestToolsScreen;
}

const PortaledTestToolsModalPage = withRequire2FAPortal(TestToolsModalPage);
const PortaledTestToolsServerPage = withRequire2FAPortal(TestToolsServerPage);

function TestToolsModalNavigator() {
    const {isRequire2FAOverlayVisible} = useRequire2FAOverlayVisibility();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => toggleTestToolsModal(), {shouldBubble: false});

    const stack = (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name={SCREENS.TEST_TOOLS_MODAL.ROOT}
                component={PortaledTestToolsModalPage}
            />
            <Stack.Screen
                name={SCREENS.TEST_TOOLS_MODAL.SERVER}
                component={PortaledTestToolsServerPage}
            />
        </Stack.Navigator>
    );

    if (isRequire2FAOverlayVisible) {
        return stack;
    }

    return <TestToolsModalFrame>{stack}</TestToolsModalFrame>;
}

export default TestToolsModalNavigator;
