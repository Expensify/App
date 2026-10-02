import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import CaretBackHeader from './CaretBackHeader';
import CollapsibleHeaderOnKeyboard from './CollapsibleHeaderOnKeyboard';

type OnboardingHeaderProps = {
    onBackButtonPress?: () => void;

    shouldShowBackButton?: boolean;

    shouldCollapseOnKeyboard?: boolean;
};

type OnboardingHeaderState = Required<Pick<OnboardingHeaderProps, 'shouldShowBackButton' | 'shouldCollapseOnKeyboard'>> & Pick<OnboardingHeaderProps, 'onBackButtonPress'>;

type RegisteredOnboardingHeaderProps = OnboardingHeaderState & {
    setHeaderState: React.Dispatch<React.SetStateAction<OnboardingHeaderState>>;
};

const DEFAULT_ONBOARDING_HEADER_STATE: OnboardingHeaderState = {
    shouldShowBackButton: false,
    shouldCollapseOnKeyboard: false,
};

const OnboardingHeaderStateContext = createContext<OnboardingHeaderState>(DEFAULT_ONBOARDING_HEADER_STATE);
const OnboardingHeaderRegistrationContext = createContext<React.Dispatch<React.SetStateAction<OnboardingHeaderState>> | null>(null);

function RegisteredOnboardingHeader({onBackButtonPress, shouldShowBackButton, shouldCollapseOnKeyboard, setHeaderState}: RegisteredOnboardingHeaderProps) {
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const onBackButtonPressRef = useRef(onBackButtonPress);
    const hasOnBackButtonPress = !!onBackButtonPress;

    useEffect(() => {
        onBackButtonPressRef.current = onBackButtonPress;
    }, [onBackButtonPress]);

    useLayoutEffect(() => {
        if (!isFocused) {
            return;
        }

        const headerState: OnboardingHeaderState = {
            onBackButtonPress: hasOnBackButtonPress ? () => onBackButtonPressRef.current?.() : undefined,
            shouldShowBackButton,
            shouldCollapseOnKeyboard,
        };
        setHeaderState(headerState);

        return () => {
            setHeaderState((currentHeaderState) => (currentHeaderState === headerState ? DEFAULT_ONBOARDING_HEADER_STATE : currentHeaderState));
        };
    }, [hasOnBackButtonPress, isFocused, setHeaderState, shouldCollapseOnKeyboard, shouldShowBackButton]);

    return <View style={styles.onboardingHeaderContainer} />;
}

function OnboardingHeader({onBackButtonPress, shouldShowBackButton = true, shouldCollapseOnKeyboard = false}: OnboardingHeaderProps) {
    const setHeaderState = useContext(OnboardingHeaderRegistrationContext);

    if (!setHeaderState) {
        return (
            <CaretBackHeader
                onBackButtonPress={onBackButtonPress}
                shouldShowBackButton={shouldShowBackButton}
            />
        );
    }

    return (
        <RegisteredOnboardingHeader
            onBackButtonPress={onBackButtonPress}
            shouldShowBackButton={shouldShowBackButton}
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
    const {onBackButtonPress, shouldShowBackButton, shouldCollapseOnKeyboard} = useContext(OnboardingHeaderStateContext);

    if (!shouldShowBackButton) {
        return null;
    }

    const header = <CaretBackHeader onBackButtonPress={onBackButtonPress} />;

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
