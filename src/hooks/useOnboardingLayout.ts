// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import variables from '@styles/variables';

type OnboardingLayout = {
    shouldUseNarrowLayout: boolean;
};

/**
 * Onboarding layout for medium screen width is narrowed similarly as on web/desktop.
 */
export default function useOnboardingLayout(): OnboardingLayout {
    const {width: windowWidth} = useWindowDimensions();

    return {shouldUseNarrowLayout: windowWidth > variables.mobileResponsiveWidthBreakpoint};
}
