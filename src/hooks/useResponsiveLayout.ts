import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import useWindowDimensions from './useWindowDimensions';

type RouteParams = ParamListBase & {
    params: {layout?: string};
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
        const isNarrowLayout = params?.layout === 'narrow' ?? false;
        const shouldUseNarrowLayout = isSmallScreenWidth || isNarrowLayout;

        return {shouldUseNarrowLayout};
    } catch (error) {
        return {shouldUseNarrowLayout: isSmallScreenWidth};
    }
}
