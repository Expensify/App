import React from 'react';
import RNFastImage from 'react-native-fast-image';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, imagePropTypes} from './imagePropTypes';
import RESIZE_MODES from './resizeModes';

class Image extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageSource: undefined,
        };
    }

    componentDidMount() {
        this.configureImageSource();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.source === this.props.source) {
            return;
        }
        this.configureImageSource();
    }

    configureImageSource() {
        const source = this.props.source;
        let imageSource = source;
        if (typeof source !== 'number' && this.props.isAuthTokenRequired) {
            const authToken = lodashGet(this.props, 'session.encryptedAuthToken', null);
            imageSource = {
                ...source,
                headers: authToken ? {
                    [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
                } : null,
            };
        }
        this.setState({imageSource});
    }

    render() {
        // eslint-disable-next-line
        const { source, ...rest } = this.props;

        // eslint-disable-next-line
        return <RNFastImage {...rest} source={this.state.imageSource} />;
    }
}

Image.propTypes = imagePropTypes;
Image.defaultProps = defaultProps;

const ImageWithOnyx = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);
ImageWithOnyx.resizeMode = RESIZE_MODES;
export default ImageWithOnyx;
