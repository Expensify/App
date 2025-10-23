import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
// eslint-disable-next-line no-restricted-imports
import type {Animated, StyleProp, ViewStyle} from 'react-native';

function isObjectStyle(style: Animated.WithAnimatedValue<StyleProp<ViewStyle>>): style is Record<string, unknown> {
    return !!style && typeof style === 'object';
}

/**
 * Higher-Order Function that enhances any card style interpolator
 * with additional custom styles while preserving the original functionality.
 *
 * @param interpolator - The original interpolator function to enhance
 * @param additionalStyles - Additional styles to merge with the original interpolator result
 * @returns Enhanced card style interpolator function
 */
const enhanceCardStyleInterpolator = (interpolator: (props: StackCardInterpolationProps) => StackCardInterpolatedStyle, additionalStyles: Partial<StackCardInterpolatedStyle>) => {
    return (props: StackCardInterpolationProps): StackCardInterpolatedStyle => {
        // Get the original result from the provided interpolator
        const enhancedResult = {...interpolator(props)};

        // Deep merge nested style objects
        if (isObjectStyle(enhancedResult.cardStyle) && isObjectStyle(additionalStyles.cardStyle)) {
            enhancedResult.cardStyle = {
                ...enhancedResult.cardStyle,
                ...additionalStyles.cardStyle,
            } as typeof enhancedResult.cardStyle;
        }

        if (isObjectStyle(enhancedResult.containerStyle) && isObjectStyle(additionalStyles.containerStyle)) {
            enhancedResult.containerStyle = {
                ...enhancedResult.containerStyle,
                ...additionalStyles.containerStyle,
            } as typeof enhancedResult.containerStyle;
        }

        if (isObjectStyle(enhancedResult.overlayStyle) && isObjectStyle(additionalStyles.overlayStyle)) {
            enhancedResult.overlayStyle = {
                ...enhancedResult.overlayStyle,
                ...additionalStyles.overlayStyle,
            } as typeof enhancedResult.overlayStyle;
        }

        if (isObjectStyle(enhancedResult.shadowStyle) && isObjectStyle(additionalStyles.shadowStyle)) {
            enhancedResult.shadowStyle = {
                ...enhancedResult.shadowStyle,
                ...additionalStyles.shadowStyle,
            } as typeof enhancedResult.shadowStyle;
        }

        return enhancedResult;
    };
};

export default enhanceCardStyleInterpolator;
