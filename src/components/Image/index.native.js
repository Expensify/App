import React from 'react';
import RNFastImage from 'react-native-fast-image';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

const Image = (props) => {
    // eslint-disable-next-line react/destructuring-assignment
    const {
        source, isAuthTokenRequired, session, ...rest
    } = props;

    let imageSource = source;
    if (typeof source !== 'number' && isAuthTokenRequired) {
        const authToken = lodashGet(props, 'session.encryptedAuthToken', null);
        imageSource = {
            ...source,
            headers: authToken ? {
                [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
            } : null,
        };
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RNFastImage {...rest} source={imageSource} />;
};

Image.propTypes = imagePropTypes;
Image.defaultProps = defaultProps;
Image.displayName = 'Image';
const ImageWithOnyx = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);
ImageWithOnyx.resizeMode = RESIZE_MODES;
export default ImageWithOnyx;
