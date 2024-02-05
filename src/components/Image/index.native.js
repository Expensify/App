import {Image as ImageComponent} from 'expo-image';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

const dimensionsCache = new Map();

function resolveDimensions(key) {
    return dimensionsCache.get(key);
}

function Image(props) {
    // eslint-disable-next-line react/destructuring-assignment
    const {source, isAuthTokenRequired, session, ...rest} = props;

    let imageSource = source;
    if (source && source.uri && typeof source.uri === 'number') {
        imageSource = source.uri;
    }
    if (typeof imageSource !== 'number' && isAuthTokenRequired) {
        const authToken = lodashGet(props, 'session.encryptedAuthToken', null);
        imageSource = {
            ...source,
            headers: authToken
                ? {
                      [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                  }
                : null,
        };
    }

    return (
        <ImageComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            source={imageSource}
            onLoad={(evt) => {
                const {width, height, url} = evt.source;
                dimensionsCache.set(url, {width, height});
                if (props.onLoad) {
                    props.onLoad({nativeEvent: {width, height}});
                }
            }}
        />
    );
}

Image.propTypes = imagePropTypes;
Image.defaultProps = defaultProps;
Image.displayName = 'Image';
const ImageWithOnyx = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);
ImageWithOnyx.resizeMode = RESIZE_MODES;
ImageWithOnyx.resolveDimensions = resolveDimensions;

export default ImageWithOnyx;
