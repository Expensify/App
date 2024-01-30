import type {ViewStyle} from 'react-native';

type VisibilityStyles = Record<'visible' | 'hidden', Pick<ViewStyle, 'visibility'>>;

export default VisibilityStyles;
