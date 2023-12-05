import React, {useCallback} from 'react';
import {Image as RNImage} from 'react-native';
import {defaultProps, imagePropTypes} from './imagePropTypes';

function BaseImage({onLoad, ...props}) {
    const imageLoadedSuccessfully = useCallback(
        ({nativeEvent}) => {
            // We override `onLoad`, so both web and native have the same signature
            const {width, height} = nativeEvent.source;
            onLoad({nativeEvent: {width, height}});
        },
        [onLoad],
    );

    return (
        <RNImage
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
