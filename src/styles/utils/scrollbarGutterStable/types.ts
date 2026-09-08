import type {ViewStyle} from 'react-native';

// `scrollbarGutter` is a web-only CSS property, so React Native's `ViewStyle` does not declare it.
type ScrollbarGutterStableStyles = ViewStyle & {scrollbarGutter?: 'stable'};

export default ScrollbarGutterStableStyles;
