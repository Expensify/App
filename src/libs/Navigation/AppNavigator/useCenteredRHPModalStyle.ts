import {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import useTheme from '@hooks/useTheme';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';

const CENTERED_MODAL_VERTICAL_MARGIN = 32;

/** Geometry of the centered RHP modal box (width/height/position/radius). Shared so the container and its inner content stay aligned. */
function useCenteredRHPModalStyle(): ViewStyle {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const theme = useTheme();

    return useMemo(() => {
        // Height tracks the viewport (minus the vertical margin on each side) but is capped so the box keeps modal-like proportions on large screens.
        const modalHeight = Math.min(windowHeight - 2 * CENTERED_MODAL_VERTICAL_MARGIN, variables.rhpCenteredModalMaxHeight);
        return {
            width: variables.rhpCenteredModalWidth,
            height: modalHeight,
            // Pin to a fixed top offset rather than centering: equal margins read as centered until the cap is reached, after which the box stays anchored near the top.
            top: CENTERED_MODAL_VERTICAL_MARGIN,
            left: (windowWidth - variables.rhpCenteredModalWidth) / 2,
            borderRadius: variables.componentBorderRadiusLarge,
            // Same drop shadow we use for centered/alert and big attachment modals.
            boxShadow: theme.shadow,
            // Without it, Safari drops the containment once the fade entry settles and the modal stretches to the bottom of the screen.
            transform: [{translateX: 0}],
        };
    }, [windowHeight, windowWidth, theme.shadow]);
}

export default useCenteredRHPModalStyle;
