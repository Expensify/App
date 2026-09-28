import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type OnboardingModalNavigatorContentWrapperProps = {
    children: React.ReactNode;
    onboardingIsMediumOrLargerScreenWidth: boolean;
};

function OnboardingModalNavigatorContentWrapper({children, onboardingIsMediumOrLargerScreenWidth}: OnboardingModalNavigatorContentWrapperProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {paddingLeft, paddingRight} = StyleUtils.getPlatformSafeAreaPadding(insets);

    // Add padding left and right to the style to account for the safe area insets
    return (
        <View
            onClick={(e) => e.stopPropagation()}
            style={[styles.maxHeight100Percentage, styles.overflowHidden, styles.OnboardingNavigatorInnerView(onboardingIsMediumOrLargerScreenWidth), {paddingLeft, paddingRight}]}
        >
            {children}
        </View>
    );
}

export default OnboardingModalNavigatorContentWrapper;
