import React, {useEffect, useMemo} from 'react';
import {Image} from 'react-native';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';

const RESIZE_MODES = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
};

const FastImage = (props) => {
    // eslint-disable-next-line
    const {source, onLoad, ...rest} = props;

    // Check for headers - if it has them then we need to instead just add the
    // encryptedAuthToken to the url as RNW's Image component headers do not properly cache
    const imageSource = useMemo(() => {
        if (typeof source === 'number' || source.headers == null) {
            return source;
        }
        return {uri: addEncryptedAuthTokenToURL(source.uri)};
    }, [source]);

    // Conform DOM onLoad event to return width and height to match RNFastImage
    // https://github.com/DylanVann/react-native-fast-image#onload-event--void
    useEffect(() => {
        if (onLoad == null) {
            return;
        }
        const uri = typeof imageSource === 'number'
            ? Image.resolveAssetSource(imageSource).uri
            : imageSource.uri;
        Image.getSize(uri, (width, height) => {
            onLoad({nativeEvent: {width, height}});
        });
    }, [imageSource, onLoad]);

    // eslint-disable-next-line
    return <Image {...rest} source={imageSource} />;
};

FastImage.displayName = 'FastImage';
FastImage.propTypes = Image.propTypes;
FastImage.resizeMode = RESIZE_MODES;
export default FastImage;
