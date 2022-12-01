import React from 'react';
import {Image as RNImage} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import {defaultProps, propTypes} from './imagePropTypes';
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
        const isAuthTokenRequired = this.props.isAuthTokenRequired;
        let imageSource = source;
        if (typeof source !== 'number' && isAuthTokenRequired) {
            const authToken = lodashGet(this.props, 'session.encryptedAuthToken', null);
            imageSource = {uri: `${source.uri}?encryptedAuthToken=${encodeURIComponent(authToken)}`};
        }
        this.setState({imageSource});

        // If an onLoad callback was specified then manually call it and pass
        // the natural image dimensions to match the native API
        if (this.props.onLoad == null) {
            return;
        }
        const uri = typeof imageSource === 'number'
            ? Image.resolveAssetSource(imageSource).uri
            : imageSource.uri;
        RNImage.getSize(uri, (width, height) => {
            this.props.onLoad({nativeEvent: {width, height}});
        });
    }

    render() {
        // eslint-disable-next-line
        const { source, onLoad, ...rest } = this.props;

        // eslint-disable-next-line
        return <RNImage {...rest} source={this.state.imageSource} />;
    }
}

Image.propTypes = propTypes;
Image.defaultProps = defaultProps;

const ImageWithOnyx = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(Image);
ImageWithOnyx.resizeMode = RESIZE_MODES;
export default ImageWithOnyx;
