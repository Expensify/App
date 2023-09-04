import {TextStyle, ViewStyle} from 'react-native';

type VisibilityStyles = Record<'visible' | 'hidden', Pick<ViewStyle | TextStyle, 'visibility'>>;

export default VisibilityStyles;
