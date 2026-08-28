import CaretBackHeader from '@components/CaretBackHeader';

import Navigation from '@libs/Navigation/Navigation';

import {useFocusEffect} from '@react-navigation/native';
import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';

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

/**
 * Holds the back-header config for the currently focused onboarding screen so a single sticky
 * header can be rendered once above the Stack.Navigator instead of inside each animated card.
 */
function OnboardingHeaderContextProvider({children}: {children: React.ReactNode}) {
    const [config, setConfig] = useState<OnboardingHeaderConfig>(defaultConfig);

    return (
        <SetOnboardingHeaderConfigContext.Provider value={setConfig}>
            <OnboardingHeaderConfigContext.Provider value={config}>{children}</OnboardingHeaderConfigContext.Provider>
        </SetOnboardingHeaderConfigContext.Provider>
    );
}

/**
 * Registers the focused onboarding screen's back-header config into the shared sticky header.
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
function useOnboardingHeaderConfig({shouldShowBackButton, onBackButtonPress}: OnboardingHeaderConfig) {
    const setConfig = useContext(SetOnboardingHeaderConfigContext);
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
}

/** The sticky header rendered once above the onboarding Stack.Navigator. Reads whatever the focused screen registered. */
function OnboardingStickyHeader() {
    const config = useContext(OnboardingHeaderConfigContext);

    return (
        <CaretBackHeader
            shouldShowBackButton={config.shouldShowBackButton}
            onBackButtonPress={config.onBackButtonPress}
        />
    );
}

export {OnboardingHeaderContextProvider, OnboardingStickyHeader, useOnboardingHeaderConfig};
