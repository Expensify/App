import React from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';
import styles from '../../styles/StyleSheet';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,
};

const ImageView = props => (
    <View style={[
            styles.widthHeight100p,
            styles.alignItemsCenter,
            styles.flexJustifyCenter,
            styles.overflowHidden,
        ]}
    >
        <Image
            source={{uri: props.url}}
            style={styles.widthHeight100p}
            resizeMode="center"
        />
    </View>
);

ImageView.propTypes = propTypes;
ImageView.displayName = 'ImageView';

export default ImageView;
