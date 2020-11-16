import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions, Image} from 'react-native';
import ImgZoom from 'react-native-image-pan-zoom';

const propTypes = {
    // URL to full-sized image
    sourceURL: PropTypes.string,

    // Image height
    imageHeight: PropTypes.number,

    // Image width
    imageWidth: PropTypes.number,

    // Window Height
    windowHeight: PropTypes.number,

    // Window Width
    windowWidth: PropTypes.number,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    sourceURL: '',
    imageHeight: 300,
    imageWidth: 300,

    // Default windowHeight accounts for the modal header height of 73
    windowHeight: Dimensions.get('window').height - 73,
    windowWidth: Dimensions.get('window').width,
    style: {},
};

/**
 * On the native layer, we use a image library to handle zoom functionality
 *
 * @param props
 * @returns {JSX.Element}
 */

const ImageView = props => (
    <View style={props.style}>
        <ImgZoom
            cropWidth={props.windowWidth}
            cropHeight={props.windowHeight}
            imageWidth={props.imageWidth}
            imageHeight={props.imageHeight}
        >
            <Image
                style={{width: props.imageWidth, height: props.imageHeight}}
                source={{uri: props.sourceURL}}
            />
        </ImgZoom>
    </View>
);

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
