// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import variables from '@styles/variables';

type OnboardingLayout = {
    isMediumOrLargerScreenWidth: boolean;
};

/**
 * The main difference between useOnboardingLayout and useWindowDimension is that
 * useWindowDimension hardcodes isSmallScreenWidth, isMediumScreenWidth and
 * isLargeScreenWidth on native platforms, while this hook below always takes
 * screen width into consideration, no matter the platform.
 */
export default function useOnboardingLayout(): OnboardingLayout {
    const {width: windowWidth} = useWindowDimensions();

    return {isMediumOrLargerScreenWidth: windowWidth > variables.mobileResponsiveWidthBreakpoint};
}
