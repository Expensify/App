import type {ScaledSize} from 'react-native';

import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';

type InitialWindowDimensions = {
    initialWidth: number;
    initialHeight: number;
};

type NewDimensions = {
    window: ScaledSize;
    screen: ScaledSize;
};

/**
 * A convenience hook that provides initial size (width and height).
 * An initial height allows to know the real height of window,
 * while the standard useWindowDimensions hook return the height minus Virtual keyboard height
 * @returns with information about initial width and height
 */
export default function (): InitialWindowDimensions {
    const [dimensions, setDimensions] = useState(() => {
        const window = Dimensions.get('window');
        const screen = Dimensions.get('screen');

        return {
            screenHeight: screen.height,
            screenWidth: screen.width,
            initialHeight: window.height,
            initialWidth: window.width,
        };
    });

    useEffect(() => {
        const onDimensionChange = (newDimensions: NewDimensions) => {
            const {window, screen} = newDimensions;

            setDimensions((oldState) => {
                // The virtual keyboard only shrinks the window height, so any width change means the window itself was resized (e.g. rotation).
                // Checking the screen size alone is not enough: on foldable phones like the iPhone Duo the screen keeps the cover panel size and doesn't change on rotation.
                const hasWindowWidthChanged = window.width !== oldState.initialWidth;
                const hasScreenChanged = screen.width !== oldState.screenWidth || screen.height !== oldState.screenHeight;
                if (hasScreenChanged || hasWindowWidthChanged || window.height > oldState.initialHeight) {
                    return {
                        initialHeight: window.height,
                        initialWidth: window.width,
                        screenHeight: screen.height,
                        screenWidth: screen.width,
                    };
                }

                return oldState;
            });
        };

        const dimensionsEventListener = Dimensions.addEventListener('change', onDimensionChange);

        return () => {
            if (!dimensionsEventListener) {
                return;
            }
            dimensionsEventListener.remove();
        };
    }, []);

    return {
        initialWidth: dimensions.initialWidth,
        initialHeight: dimensions.initialHeight,
    };
}
