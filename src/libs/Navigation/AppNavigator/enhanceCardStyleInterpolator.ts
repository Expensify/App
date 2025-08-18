import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';

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
        const originalResult = interpolator(props);

        // Merge the original result with additional styles
        const enhancedResult = {
            ...originalResult,
            ...additionalStyles,
        };

        // Deep merge nested style objects
        if (originalResult.cardStyle && additionalStyles.cardStyle && typeof originalResult.cardStyle === 'object' && typeof additionalStyles.cardStyle === 'object') {
            enhancedResult.cardStyle = {
                ...originalResult.cardStyle,
                ...additionalStyles.cardStyle,
            } as typeof originalResult.cardStyle;
        }

        if (originalResult.containerStyle && additionalStyles.containerStyle && typeof originalResult.containerStyle === 'object' && typeof additionalStyles.containerStyle === 'object') {
            enhancedResult.containerStyle = {
                ...originalResult.containerStyle,
                ...additionalStyles.containerStyle,
            } as typeof originalResult.containerStyle;
        }

        if (originalResult.overlayStyle && additionalStyles.overlayStyle && typeof originalResult.overlayStyle === 'object' && typeof additionalStyles.overlayStyle === 'object') {
            enhancedResult.overlayStyle = {
                ...originalResult.overlayStyle,
                ...additionalStyles.overlayStyle,
            } as typeof originalResult.overlayStyle;
        }

        return enhancedResult;
    };
};

export default enhanceCardStyleInterpolator;
