import React from 'react';
import BaseLottie from './BaseLottie';
import type BaseLottieProps from './types';

function Lottie({...rest}: Omit<BaseLottieProps, 'shouldLoadAfterInteractions'>) {
    return (
        <BaseLottie
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            // On iOS, the navigation transition is not smooth if the Lottie animation is loaded
            // before the user interaction is complete. Therefore, we should load the animation
            // only after interactions are finished.
            shouldLoadAfterInteractions
        />
    );
}

Lottie.displayName = 'Lottie';
export default Lottie;
