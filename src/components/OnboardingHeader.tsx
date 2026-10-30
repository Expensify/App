import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';

import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';

import CaretBackHeader from './CaretBackHeader';
import CollapsibleHeaderOnKeyboard from './CollapsibleHeaderOnKeyboard';
import ScreenWrapperStatusContext from './ScreenWrapper/ScreenWrapperStatusContext';

type OnboardingHeaderProps = {
    onBackButtonPress?: () => void;

    onCloseButtonPress?: () => void;

    shouldShowBackButton?: boolean;

    shouldShowCloseButton?: boolean;

    shouldCollapseOnKeyboard?: boolean;

    shouldEnableMaxHeight?: boolean;
};

type OnboardingHeaderState = Required<Pick<OnboardingHeaderProps, 'shouldShowBackButton' | 'shouldShowCloseButton' | 'shouldCollapseOnKeyboard' | 'shouldEnableMaxHeight'>> &
    Pick<OnboardingHeaderProps, 'onBackButtonPress' | 'onCloseButtonPress'> & {
        isHeaderFocused?: boolean;
    };

type RegisteredOnboardingHeaderProps = OnboardingHeaderProps & {
    setHeaderState: React.Dispatch<React.SetStateAction<OnboardingHeaderState>>;
};

const DEFAULT_ONBOARDING_HEADER_STATE: OnboardingHeaderState = {
    shouldShowBackButton: false,
    shouldShowCloseButton: false,
    shouldCollapseOnKeyboard: false,
    shouldEnableMaxHeight: false,
    isHeaderFocused: false,
};

const OnboardingHeaderStateContext = createContext<OnboardingHeaderState>(DEFAULT_ONBOARDING_HEADER_STATE);
const OnboardingHeaderRegistrationContext = createContext<React.Dispatch<React.SetStateAction<OnboardingHeaderState>> | null>(null);

function RegisteredOnboardingHeader({
    onBackButtonPress,
    onCloseButtonPress,
    shouldShowBackButton = true,
    shouldShowCloseButton = false,
    shouldCollapseOnKeyboard = false,
    shouldEnableMaxHeight: shouldEnableMaxHeightProp,
    setHeaderState,
}: RegisteredOnboardingHeaderProps) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);
    const shouldEnableMaxHeight = shouldEnableMaxHeightProp ?? screenWrapperStatus?.shouldEnableMaxHeight ?? false;
    const onBackButtonPressRef = useRef(onBackButtonPress);
    const onCloseButtonPressRef = useRef(onCloseButtonPress);
    const hasOnBackButtonPress = !!onBackButtonPress;
    const hasOnCloseButtonPress = !!onCloseButtonPress;

    useEffect(() => {
        onBackButtonPressRef.current = onBackButtonPress;
    }, [onBackButtonPress]);

    useEffect(() => {
        onCloseButtonPressRef.current = onCloseButtonPress;
    }, [onCloseButtonPress]);

    const [isHeaderFocused, setIsHeaderFocused] = useState(false);

    useLayoutEffect(() => {
        if (!isFocused) {
            return;
        }

        const headerState: OnboardingHeaderState = {
            onBackButtonPress: hasOnBackButtonPress ? () => onBackButtonPressRef.current?.() : undefined,
            onCloseButtonPress: hasOnCloseButtonPress ? () => onCloseButtonPressRef.current?.() : undefined,
            shouldShowBackButton,
            shouldShowCloseButton,
            shouldCollapseOnKeyboard,
            shouldEnableMaxHeight,
            isHeaderFocused,
        };
        setHeaderState(headerState);

        return () => {
            setHeaderState((currentHeaderState) => (currentHeaderState === headerState ? DEFAULT_ONBOARDING_HEADER_STATE : currentHeaderState));
        };
    }, [
        hasOnBackButtonPress,
        hasOnCloseButtonPress,
        isFocused,
        isHeaderFocused,
        setHeaderState,
        shouldCollapseOnKeyboard,
        shouldEnableMaxHeight,
        shouldShowBackButton,
        shouldShowCloseButton,
    ]);

    // On native platforms, the sticky header is directly interactive and accessible to touch and screen readers (VoiceOver/TalkBack).
    // On web, ScreenWrapper's FocusTrapForScreen traps keyboard Tab navigation within the screen, so an interactive
    // header must be rendered inside the screen flow for keyboard focus.
    if (Platform.OS !== 'web') {
        return <View style={styles.onboardingHeaderContainer} />;
    }

    return (
        <View
            onFocus={() => setIsHeaderFocused(true)}
            onBlur={() => setIsHeaderFocused(false)}
            style={isHeaderFocused ? undefined : styles.opacity0}
        >
            <CaretBackHeader
                onBackButtonPress={onBackButtonPress}
                onCloseButtonPress={onCloseButtonPress}
                shouldShowBackButton={shouldShowBackButton}
                shouldShowCloseButton={shouldShowCloseButton}
            />
        </View>
    );
}

function OnboardingHeader({
    onBackButtonPress,
    onCloseButtonPress,
    shouldShowBackButton = true,
    shouldShowCloseButton = false,
    shouldCollapseOnKeyboard = false,
    shouldEnableMaxHeight,
}: OnboardingHeaderProps) {
    const setHeaderState = useContext(OnboardingHeaderRegistrationContext);

    if (!setHeaderState) {
        return (
            <CaretBackHeader
                onBackButtonPress={onBackButtonPress}
                onCloseButtonPress={onCloseButtonPress}
                shouldShowBackButton={shouldShowBackButton}
                shouldShowCloseButton={shouldShowCloseButton}
            />
        );
    }

    return (
        <RegisteredOnboardingHeader
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
            shouldShowBackButton={shouldShowBackButton}
            shouldShowCloseButton={shouldShowCloseButton}
            shouldCollapseOnKeyboard={shouldCollapseOnKeyboard}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
            setHeaderState={setHeaderState}
        />
    );
}

function OnboardingHeaderProvider({children}: {children: React.ReactNode}) {
    const [headerState, setHeaderState] = useState(DEFAULT_ONBOARDING_HEADER_STATE);

    return (
        <OnboardingHeaderRegistrationContext.Provider value={setHeaderState}>
            <OnboardingHeaderStateContext.Provider value={headerState}>{children}</OnboardingHeaderStateContext.Provider>
        </OnboardingHeaderRegistrationContext.Provider>
    );
}

function OnboardingStickyHeader() {
    const styles = useThemeStyles();
    const {paddingTop} = useSafeAreaPaddings();
    const viewportOffsetTop = useViewportOffsetTop();
    const {onBackButtonPress, onCloseButtonPress, shouldShowBackButton, shouldShowCloseButton, shouldCollapseOnKeyboard, shouldEnableMaxHeight, isHeaderFocused} =
        useContext(OnboardingHeaderStateContext);

    if (!shouldShowBackButton && !shouldShowCloseButton) {
        return null;
    }

    const isWeb = Platform.OS === 'web';
    const header = (
        <CaretBackHeader
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
            shouldShowBackButton={shouldShowBackButton}
            shouldShowCloseButton={shouldShowCloseButton}
            isFocusable={!isWeb}
        />
    );

    return (
        <View
            pointerEvents="box-none"
            accessibilityElementsHidden={isWeb}
            importantForAccessibility={isWeb ? 'no-hide-descendants' : undefined}
            aria-hidden={isWeb}
            style={[styles.onboardingStickyHeaderContainer, {paddingTop}, shouldEnableMaxHeight && {marginTop: viewportOffsetTop}, isHeaderFocused && styles.opacity0]}
        >
            {shouldCollapseOnKeyboard ? <CollapsibleHeaderOnKeyboard alwaysCollapseHeaderOnKeyboard>{header}</CollapsibleHeaderOnKeyboard> : header}
        </View>
    );
}

export {OnboardingHeaderProvider, OnboardingStickyHeader};
export default OnboardingHeader;
