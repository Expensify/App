import {useRoute} from '@react-navigation/native';
import useWindowDimensions from './useWindowDimensions';

type RouteParams = {
    isInRHP?: boolean;
};

type ResponsiveLayoutResult = {
    shouldUseNarrowLayout: boolean;
};

/**
 * Hook to determine if we are on mobile devices or in the RHP
 */
export default function useResponsiveLayout(): ResponsiveLayoutResult {
    // eslint-disable-next-line rulesdir/prefer-use-responsive-for-layout
    const {isSmallScreenWidth} = useWindowDimensions();

    let params: RouteParams = {};

    try {
        const route = useRoute();
        if (route && route.params) {
            params = route.params as RouteParams;
        }
    } catch (error) {
        return {
            shouldUseNarrowLayout: false,
        };
    }
    return {
        shouldUseNarrowLayout: isSmallScreenWidth || ((params as RouteParams)?.isInRHP ?? false),
    };
}
