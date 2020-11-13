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
    cropHeight: PropTypes.number,

    // Window Width
    cropWidth: PropTypes.number,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    sourceURL: '',
    imageHeight: 300,
    imageWidth: 300,

    // Default cropHeight accounts for the modal header height of 60
    cropHeight: Dimensions.get('window').height - 60,
    cropWidth: Dimensions.get('window').width,
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
            cropWidth={props.cropWidth}
            cropHeight={props.cropHeight}
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
