import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import ImgZoom from 'react-native-image-pan-zoom';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import {variables} from '../../styles/StyleSheet';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,

    // Image height
    height: PropTypes.number,

    // Image width
    width: PropTypes.number,

    // Callback to fire when image is measured
    onMeasure: PropTypes.func,
};

const defaultProps = {
    height: 300,
    width: 300,
    onMeasure: () => {},
};

const ImageView = (props) => {
    // Default windowHeight accounts for the modal header height
    const windowHeight = Dimensions.get('window').height - variables.modalHeaderBarHeight;
    const windowWidth = Dimensions.get('window').width;

    return (
        <View>
            <ImgZoom
                cropWidth={windowWidth}
                cropHeight={windowHeight}
                imageWidth={props.width}
                imageHeight={props.height}
            >
                <ImageWithSizeCalculation
                    url={props.url}
                    onMeasure={props.onMeasure}
                    width={props.width}
                    height={props.height}
                />
            </ImgZoom>
        </View>
    );
};

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
