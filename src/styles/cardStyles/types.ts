import {ViewStyle} from 'react-native';

type GetCardStyles = (screenWidth: number) => Pick<ViewStyle, 'position' | 'width' | 'height'>;

export default GetCardStyles;
