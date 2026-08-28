import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import {OnboardingHeaderContextProvider, OnboardingStickyHeader} from './OnboardingHeaderContext';

type OnboardingModalNavigatorContentWrapperProps = {
    /** Rendered child component */
    children: React.ReactNode;

    /** Whether the onboarding is on a medium or larger screen width */
    onboardingIsMediumOrLargerScreenWidth: boolean;
};

function OnboardingModalNavigatorContentWrapper({children, onboardingIsMediumOrLargerScreenWidth}: OnboardingModalNavigatorContentWrapperProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {paddingTop} = StyleUtils.getPlatformSafeAreaPadding(insets);

    return (
        <OnboardingHeaderContextProvider>
            <View
                onClick={(e) => e.stopPropagation()}
                style={[styles.maxHeight100Percentage, styles.overflowHidden, styles.OnboardingNavigatorInnerView(onboardingIsMediumOrLargerScreenWidth)]}
            >
                {/* Sticky back-caret header rendered once above the Stack.Navigator so it stays put across screen transitions. */}
                {/* It owns the top safe area inset because it renders outside the per screen ScreenWrapper, which is why those screens pass includePaddingTop false. */}
                <View style={{paddingTop}}>
                    <OnboardingStickyHeader />
                </View>
                {children}
            </View>
        </OnboardingHeaderContextProvider>
    );
}

export default OnboardingModalNavigatorContentWrapper;
