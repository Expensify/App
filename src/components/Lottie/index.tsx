import React from 'react';
import BaseLottie from './BaseLottie';
import type BaseLottieProps from './types';

function Lottie({...rest}: Omit<BaseLottieProps, 'shouldLoadAfterInteractions'>) {
    return (
        <BaseLottie
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

Lottie.displayName = 'Lottie';
export default Lottie;
