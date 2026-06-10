import {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';

const CENTERED_MODAL_VERTICAL_MARGIN = 20;

/** Geometry of the centered RHP modal box (width/height/position/radius). Shared so the container and its inner content stay aligned. */
function useCenteredRHPModalStyle(): ViewStyle {
    const {windowWidth, windowHeight} = useWindowDimensions();

    return useMemo(() => {
        // Cap the height so the modal keeps a modal-like aspect ratio instead of stretching tall on large screens.
        const modalHeight = Math.min(windowHeight - 2 * CENTERED_MODAL_VERTICAL_MARGIN, variables.rhpCenteredModalMaxHeight);
        return {
            width: variables.rhpCenteredModalWidth,
            height: modalHeight,
            top: (windowHeight - modalHeight) / 2,
            left: (windowWidth - variables.rhpCenteredModalWidth) / 2,
            borderRadius: variables.componentBorderRadiusLarge,
        };
    }, [windowHeight, windowWidth]);
}

export default useCenteredRHPModalStyle;
