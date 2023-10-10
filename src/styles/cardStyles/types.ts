import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';

type GetCardStyles = (screenWidth: number) => Partial<Pick<CSSProperties | ViewStyle, 'position' | 'width' | 'height' | 'transform'>>;

export default GetCardStyles;
