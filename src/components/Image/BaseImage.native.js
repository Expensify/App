import {Image as ExpoImage} from 'expo-image';
import React, {useCallback} from 'react';
import {defaultProps, imagePropTypes} from './imagePropTypes';

function BaseImage({onLoad, ...props}) {
    const imageLoadedSuccessfully = useCallback(
        (event) => {
            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = event.source;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad],
    );

    return (
        <ExpoImage
            // Only subscribe to onLoad when a handler is provided to avoid unnecessary event registrations, optimizing performance.
            onLoad={onLoad ? imageLoadedSuccessfully : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

BaseImage.propTypes = imagePropTypes;
BaseImage.defaultProps = defaultProps;
BaseImage.displayName = 'BaseImage';

export default BaseImage;
