import React from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';
import styles from '../../styles/styles';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,
};

const ImageView = props => (
    <View
        style={[
            styles.w100,
            styles.h100,
            styles.alignItemsCenter,
            styles.justifyContentCenter,
            styles.overflowHidden,
        ]}
    >
        <Image
            source={{uri: props.url}}
            style={[
                styles.w100,
                styles.h100,
            ]}
            resizeMode="center"
        />
    </View>
);

ImageView.propTypes = propTypes;
ImageView.displayName = 'ImageView';

export default ImageView;
