import spacing from './utilities/spacing';
import themeColors from './themes/default';

export default function getTooltipStyles(
    interpolatedSize,
    xOffset,
    yOffset,
    width,
    // eslint-disable-next-line no-unused-vars
    height,
    tooltipWidth,
    // eslint-disable-next-line no-unused-vars
    tooltipHeight,
) {
    return {
        animationStyle: {
            transform: [{
                scale: interpolatedSize,
            }],
        },
        tooltipWrapperStyle: {
            position: 'absolute',
            backgroundColor: themeColors.heading,
            borderRadius: 4,
            ...spacing.p1,

            // Shift the tooltip up by...
            //   11 (font height)
            // + 4 (top padding)
            // + 4 (bottom padding)
            // + 4 (upward shift of the pointer)
            // + 3 (pointer height - 1)
            // = 26
            top: -26,

            // Shift the tooltip to the left by half the component's width + half the tooltip's width
            left: (tooltipWidth / -2) + (width / 2),
        },
        pointerWrapperStyle: {
            position: 'absolute',

            // Shift the pointer up by its height
            top: -4,

            // Shift the pointer to the right (to the middle of the wrapped element)
            left: (width / 2) - 4,
        },
    };
}
