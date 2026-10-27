import type {StyleProp, ViewStyle} from 'react-native';

type LiquidGlassBackgroundProps = {
    /** Color the glass is tinted with, e.g. a button's own fill */
    tintColor?: string;

    /** How strongly `tintColor` tints the glass, leaving the rest to show what is behind it */
    tintOpacity?: number;

    /** Shape of the glass, e.g. a circle radius matching the button it sits behind */
    style?: StyleProp<ViewStyle>;
};

export default LiquidGlassBackgroundProps;
