import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string,

    // Image height
    height: PropTypes.number,

    // Image width
    width: PropTypes.number,

    // Callback to fire when image is measured
    onMeasure: PropTypes.func.isRequired,
};

const defaultProps = {
    url: '',
    height: 300,
    width: 300,
};

const ImageView = props => (
    <View>
        <ImageWithSizeCalculation
            onMeasure={props.onMeasure}
            url={props.url}
            width={props.width}
            height={props.height}
        />
    </View>
);

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
