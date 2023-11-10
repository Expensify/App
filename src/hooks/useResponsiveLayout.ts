import {ParamListBase, RouteProp, useRoute} from '@react-navigation/native';
import useWindowDimensions from './useWindowDimensions';

type RouteParams = ParamListBase & {
    params: {isInRHP?: boolean};
};
type ResponsiveLayoutResult = {
    shouldUseNarrowLayout: boolean;
};
/**
 * Hook to determine if we are on mobile devices or in the RHP
 */
export default function useResponsiveLayout(): ResponsiveLayoutResult {
    const {isSmallScreenWidth} = useWindowDimensions();
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const {params} = useRoute<RouteProp<RouteParams, 'params'>>();
        console.log(params);
        return {shouldUseNarrowLayout: isSmallScreenWidth || (params?.isInRHP ?? false)};
    } catch (error) {
        return {
            shouldUseNarrowLayout: false,
        };
    }
}
