import NoDropZone from '@components/DragAndDrop/NoDropZone';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import TestToolsModalPage from '@components/TestToolsModalPage';
import TestToolsServerPage from '@components/TestToolsServerPage';

import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useRequire2FAOverlayVisibility, {REQUIRE_2FA_ABOVE_PORTAL_HOST} from '@hooks/useRequire2FAOverlayVisibility';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import shouldLiftTestToolsAboveRequire2FA from '@libs/Navigation/helpers/shouldLiftTestToolsAboveRequire2FA';
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
import {useContext, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import Overlay from './Overlay';
import TestToolsLiftContext from './TestToolsLiftContext';
import TestToolsPortalBackdrop from './TestToolsPortalBackdrop';

const Stack = createPlatformStackNavigator<TestToolsModalModalNavigatorParamList>();

type TestToolsRouteName = keyof TestToolsModalModalNavigatorParamList;

type TestToolsModalFrameProps = {
    children: ReactNode;

    /** Keep the stack in this same slot, without painting the sheet. Used while the focused screen is portaled. */
    isPassThrough?: boolean;

    /** This frame is the copy above the required-2FA overlay, so it needs its own dim and safe-area inset. */
    isPortaled?: boolean;
};

function TestToolsModalFrame({children, isPassThrough = false, isPortaled = false}: TestToolsModalFrameProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {left, right} = useSafeAreaInsets();
    const outerViewRef = useRef<ComponentRef<typeof View>>(null);
    const isAuthenticated = useIsAuthenticated();
    const showChrome = !isPassThrough;

    const handleOuterClick = () => {
        // Release focus from any focused element before closing the modal
        blurActiveElement();
        requestAnimationFrame(() => {
            toggleTestToolsModal();
        });
    };

    const handleInnerClick = (e: MouseEvent) => {
        e.stopPropagation();
    };

    const portaledInsetStyle = isPortaled ? {paddingLeft: left, paddingRight: right} : undefined;

    return (
        <View style={[styles.flex1, portaledInsetStyle]}>
            <NoDropZone>
                <View
                    pointerEvents="none"
                    style={showChrome ? StyleSheet.absoluteFill : styles.dNone}
                >
                    {isPortaled && <TestToolsPortalBackdrop />}
                    <Overlay />
                </View>
                <PressableWithoutFeedback
                    ref={outerViewRef}
                    onPress={showChrome ? handleOuterClick : undefined}
                    pointerEvents={showChrome ? 'auto' : 'box-none'}
                    sentryLabel="TestToolsModalNavigator-Dismiss"
                    style={[styles.flex1, showChrome && styles.alignItemsCenter, showChrome && styles.getTestToolsNavigatorOuterView(shouldUseNarrowLayout)]}
                    accessible={false}
                >
                    <FocusTrapForScreens focusTrapSettings={showChrome ? undefined : {active: false}}>
                        <View
                            onStartShouldSetResponder={showChrome ? () => true : undefined}
                            onClick={showChrome ? handleInnerClick : undefined}
                            pointerEvents={showChrome ? 'auto' : 'box-none'}
                            style={showChrome ? styles.getTestToolsNavigatorInnerView(shouldUseNarrowLayout, isAuthenticated) : styles.flex1}
                        >
                            {children}
                        </View>
                    </FocusTrapForScreens>
                </PressableWithoutFeedback>
            </NoDropZone>
        </View>
    );
}

/**
 * On web and Android, move the focused screen into the portal host above the required-2FA overlay.
 * The nested stack stays in the root navigator so the URL, backTo, and goBack keep working.
 * The host is outside that stack, so the frame gets the screen contexts it reads.
 *
 * iOS stays in place. Moving that screen into the portal host leaves an empty opaque window,
 * which covers the tools once the modal transition ends.
 */
function withRequire2FAPortal<RouteName extends TestToolsRouteName>(Screen: ComponentType<PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, RouteName>>) {
    function Require2FAPortaledTestToolsScreen(props: PlatformStackScreenProps<TestToolsModalModalNavigatorParamList, RouteName>) {
        const {shouldLift, cardAnimation} = useContext(TestToolsLiftContext);
        const navigation = useContext(NavigationContext);
        const route = useContext(NavigationRouteContext);
        const isFocused = useIsFocused();

        if (!shouldLift) {
            return <Screen {...props} />;
        }

        // A stack keeps the previous screen mounted. Only the focused one should cover the 2FA screen.
        if (!isFocused || !navigation || !route) {
            return null;
        }

        const screenFrame = (
            <TestToolsModalFrame isPortaled>
                <Screen {...props} />
            </TestToolsModalFrame>
        );
        // The nested screen's card is a push, not the modal fade. Keep the root modal's animation on the dim.
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
    const shouldLift = shouldLiftTestToolsAboveRequire2FA(isRequire2FAOverlayVisible);
    const cardAnimation = useContext(CardAnimationContext);
    const lift = {shouldLift, cardAnimation};

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => toggleTestToolsModal(), {shouldBubble: false});

    return (
        <TestToolsLiftContext.Provider value={lift}>
            <TestToolsModalFrame isPassThrough={shouldLift}>
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
            </TestToolsModalFrame>
        </TestToolsLiftContext.Provider>
    );
}

export default TestToolsModalNavigator;
