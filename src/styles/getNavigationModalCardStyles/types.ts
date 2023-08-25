import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import {Merge} from 'type-fest';

type GetNavigationModalCardStylesParams = {isSmallScreenWidth: number};
type GetNavigationModalCardStylesKeys = 'position' | 'top' | 'right' | 'width' | 'backgroundColor' | 'height';

type GetNavigationModalCardStyles = ({isSmallScreenWidth}: GetNavigationModalCardStylesParams) => Merge<Pick<ViewStyle, GetNavigationModalCardStylesKeys>, Pick<CSSProperties, 'position'>>;

export default GetNavigationModalCardStyles;
