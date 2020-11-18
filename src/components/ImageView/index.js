import React from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';

const propTypes = {
    // URL to full-sized image
    sourceURL: PropTypes.string,

    // Image height
    imageHeight: PropTypes.number,

    // Image width
    imageWidth: PropTypes.number,

    // Any additional styles to apply
    wrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const defaultProps = {
    sourceURL: '',
    imageHeight: 300,
    imageWidth: 300,
    wrapperStyle: {},
};

const ImageView = props => (
    <View style={props.wrapperStyle}>
        <Image
            source={{uri: props.sourceURL}}
            style={{
                width: props.imageWidth,
                height: props.imageHeight
            }}
        />
    </View>
);

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
