import React from 'react';
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
    const {source, ...rest} = props;

    // Check for headers - if it has them then we need to instead just add the
    // encryptedAuthToken to the url and RNW's Image component headers do not work (or do they just not cache?)
    if (typeof source === 'number' || props.source.headers == null) {
        // eslint-disable-next-line
        return <Image source={props.source} {...rest} />;
    }
    // eslint-disable-next-line
    return <Image source={{uri: addEncryptedAuthTokenToURL(props.source.uri)}} {...rest} />;
};

FastImage.displayName = 'FastImage';
FastImage.propTypes = Image.propTypes;
FastImage.resizeMode = RESIZE_MODES;
export default FastImage;
