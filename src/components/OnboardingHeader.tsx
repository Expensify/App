import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import CaretBackHeader from './CaretBackHeader';
import CollapsibleHeaderOnKeyboard from './CollapsibleHeaderOnKeyboard';

type OnboardingHeaderProps = {
    onBackButtonPress?: () => void;

    onCloseButtonPress?: () => void;

    shouldShowBackButton?: boolean;

    shouldShowCloseButton?: boolean;

    shouldCollapseOnKeyboard?: boolean;
};

type OnboardingHeaderState = Required<Pick<OnboardingHeaderProps, 'shouldShowBackButton' | 'shouldShowCloseButton' | 'shouldCollapseOnKeyboard'>> &
    Pick<OnboardingHeaderProps, 'onBackButtonPress' | 'onCloseButtonPress'>;

type RegisteredOnboardingHeaderProps = OnboardingHeaderState & {
    setHeaderState: React.Dispatch<React.SetStateAction<OnboardingHeaderState>>;
};

const DEFAULT_ONBOARDING_HEADER_STATE: OnboardingHeaderState = {
    shouldShowBackButton: false,
    shouldShowCloseButton: false,
    shouldCollapseOnKeyboard: false,
};

const OnboardingHeaderStateContext = createContext<OnboardingHeaderState>(DEFAULT_ONBOARDING_HEADER_STATE);
const OnboardingHeaderRegistrationContext = createContext<React.Dispatch<React.SetStateAction<OnboardingHeaderState>> | null>(null);

function RegisteredOnboardingHeader({
    onBackButtonPress,
    onCloseButtonPress,
    shouldShowBackButton,
    shouldShowCloseButton,
    shouldCollapseOnKeyboard,
    setHeaderState,
}: RegisteredOnboardingHeaderProps) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
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
        };
        setHeaderState(headerState);

        return () => {
            setHeaderState((currentHeaderState) => (currentHeaderState === headerState ? DEFAULT_ONBOARDING_HEADER_STATE : currentHeaderState));
        };
    }, [hasOnBackButtonPress, hasOnCloseButtonPress, isFocused, setHeaderState, shouldCollapseOnKeyboard, shouldShowBackButton, shouldShowCloseButton]);

    return <View style={styles.onboardingHeaderContainer} />;
}

function OnboardingHeader({onBackButtonPress, onCloseButtonPress, shouldShowBackButton = true, shouldShowCloseButton = false, shouldCollapseOnKeyboard = false}: OnboardingHeaderProps) {
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
    const {onBackButtonPress, onCloseButtonPress, shouldShowBackButton, shouldShowCloseButton, shouldCollapseOnKeyboard} = useContext(OnboardingHeaderStateContext);

    if (!shouldShowBackButton && !shouldShowCloseButton) {
        return null;
    }

    const header = (
        <CaretBackHeader
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
            shouldShowBackButton={shouldShowBackButton}
            shouldShowCloseButton={shouldShowCloseButton}
        />
    );

    return (
        <View
            pointerEvents="box-none"
            style={[styles.onboardingStickyHeaderContainer, {paddingTop}]}
        >
            {shouldCollapseOnKeyboard ? <CollapsibleHeaderOnKeyboard alwaysCollapseHeaderOnKeyboard>{header}</CollapsibleHeaderOnKeyboard> : header}
        </View>
    );
}

export {OnboardingHeaderProvider, OnboardingStickyHeader};
export default OnboardingHeader;
