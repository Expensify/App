import {ViewStyle} from 'react-native';

type GetNavigationModalCardStylesParams = {shouldUseNarrowLayout: number};

type GetNavigationModalCardStyles = (params: GetNavigationModalCardStylesParams) => ViewStyle;

export default GetNavigationModalCardStyles;
