import CaretBackHeader from '@components/CaretBackHeader';

import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';

import Navigation from '@libs/Navigation/Navigation';

import type {LayoutChangeEvent} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type OnboardingHeaderConfig = {
    /** Whether the sticky onboarding header should render the back caret for the focused screen */
    shouldShowBackButton: boolean;

    /** Handler invoked when the back caret is pressed. Falls back to Navigation.goBack when omitted. */
    onBackButtonPress?: () => void;
};

type SetOnboardingHeaderConfig = React.Dispatch<React.SetStateAction<OnboardingHeaderConfig>>;

// The first onboarding screen never shows a back button, so seed the default hidden to avoid a caret flash before the focused screen registers.
const defaultConfig: OnboardingHeaderConfig = {shouldShowBackButton: false};

// Split into two contexts (data vs. action) so screens that only register config don't re-render when the config value changes.
const OnboardingHeaderConfigContext = createContext<OnboardingHeaderConfig>(defaultConfig);
const SetOnboardingHeaderConfigContext = createContext<SetOnboardingHeaderConfig>(() => {});

// The sticky header renders above the Stack.Navigator (outside each screen's ScreenWrapper), so the focused screen's
// KeyboardAvoidingView has no way to know that chrome exists. The header measures itself and publishes its height here so
// each onboarding ScreenWrapper can offset its keyboard avoidance by the same amount and keep footer buttons above the keyboard.
const OnboardingHeaderHeightContext = createContext<number>(0);
const SetOnboardingHeaderHeightContext = createContext<React.Dispatch<React.SetStateAction<number>>>(() => {});

/**
 * Holds the back-header config for the currently focused onboarding screen so a single sticky
 * header can be rendered once above the Stack.Navigator instead of inside each animated card.
 */
function OnboardingHeaderContextProvider({children}: {children: React.ReactNode}) {
    const [config, setConfig] = useState<OnboardingHeaderConfig>(defaultConfig);
    const [headerHeight, setHeaderHeight] = useState(0);

    return (
        <SetOnboardingHeaderConfigContext.Provider value={setConfig}>
            <SetOnboardingHeaderHeightContext.Provider value={setHeaderHeight}>
                <OnboardingHeaderConfigContext.Provider value={config}>
                    <OnboardingHeaderHeightContext.Provider value={headerHeight}>{children}</OnboardingHeaderHeightContext.Provider>
                </OnboardingHeaderConfigContext.Provider>
            </SetOnboardingHeaderHeightContext.Provider>
        </SetOnboardingHeaderConfigContext.Provider>
    );
}

/**
 * Registers the focused onboarding screen's back-header config into the shared sticky header and returns the
 * `keyboardVerticalOffset` that screen should pass to its `ScreenWrapper`.
 *
 * The offset equals the height of the chrome above the Stack.Navigator (top safe-area inset + sticky header). Because the
 * sticky header renders outside each screen's `ScreenWrapper`, the iOS `KeyboardAvoidingView` (which computes keyboard
 * overlap from its parent-relative layout, with no `automaticOffset`) would otherwise under-pad the bottom by exactly that
 * amount and hide the footer button behind the keyboard. Feeding it back as `keyboardVerticalOffset` compensates.
 *
 * Using useFocusEffect (rather than a plain effect) means the *incoming* screen re-asserts its
 * config the moment focus flips during a transition, so the sticky header always reflects the
 * focused screen and stale values from the outgoing screen don't linger.
 *
 * `onBackButtonPress` is read through a ref so the focus effect only re-registers when
 * `shouldShowBackButton` (the value that actually affects rendering) changes. Screens can pass a
 * fresh inline handler each render without triggering extra re-registrations, while the caret still
 * always invokes the latest handler.
 */
function useOnboardingHeaderConfig({shouldShowBackButton, onBackButtonPress}: OnboardingHeaderConfig): number {
    const setConfig = useContext(SetOnboardingHeaderConfigContext);
    const keyboardVerticalOffset = useContext(OnboardingHeaderHeightContext);
    const onBackButtonPressRef = useRef(onBackButtonPress);

    useEffect(() => {
        onBackButtonPressRef.current = onBackButtonPress;
    }, [onBackButtonPress]);

    useFocusEffect(
        useCallback(() => {
            const registeredConfig: OnboardingHeaderConfig = {
                shouldShowBackButton,
                onBackButtonPress: () => {
                    const handler = onBackButtonPressRef.current;

                    if (handler) {
                        handler();
                        return;
                    }

                    Navigation.goBack();
                },
            };

            setConfig(registeredConfig);

            return () => {
                setConfig((currentConfig) => (currentConfig === registeredConfig ? defaultConfig : currentConfig));
            };
        }, [shouldShowBackButton, setConfig]),
    );

    return keyboardVerticalOffset;
}

/**
 * The sticky header rendered once above the onboarding Stack.Navigator. Reads whatever the focused screen registered.
 *
 * It owns the top safe-area inset (it renders outside the per-screen ScreenWrapper, which is why those screens pass
 * `includePaddingTop={false}`) and measures its own height so screens can offset their KeyboardAvoidingView by the same
 * amount via `useOnboardingHeaderConfig`.
 */
function OnboardingStickyHeader() {
    const config = useContext(OnboardingHeaderConfigContext);
    const setHeaderHeight = useContext(SetOnboardingHeaderHeightContext);
    const insets = useSafeAreaInsets();
    const StyleUtils = useStyleUtils();
    const {paddingTop} = StyleUtils.getPlatformSafeAreaPadding(insets);

    return (
        <View
            style={{paddingTop}}
            onLayout={(event: LayoutChangeEvent) => setHeaderHeight(event.nativeEvent.layout.height)}
        >
            <CaretBackHeader
                shouldShowBackButton={config.shouldShowBackButton}
                onBackButtonPress={config.onBackButtonPress}
            />
        </View>
    );
}

export {OnboardingHeaderContextProvider, OnboardingStickyHeader, useOnboardingHeaderConfig};
