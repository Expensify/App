import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import styles from '../../styles/StyleSheet';
import ImageZoom from 'react-native-image-pan-zoom';

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

class ImageView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 100,
            imageHeight: 100,
        };
    }

    render() {
        // Default windowHeight accounts for the modal header height
        const windowHeight = Dimensions.get('window').height - variables.modalHeaderBarHeight;
        const windowWidth = Dimensions.get('window').width;
        return (
            <View
                style={[
                    styles.widthHeight100p,
                    styles.alignItemsCenter,
                    styles.flexJustifyCenter,
                    styles.overflowHidden,
                ]}
            >
                <ImageZoom
                    cropWidth={windowWidth}
                    cropHeight={windowHeight}
                    imageWidth={this.state.imageWidth}
                    imageHeight={this.state.imageHeight}
                >
                    <ImageWithSizeCalculation
                        url={this.props.url}
                        onMeasure={({width, height}) => this.setState({imageHeight: height, imageWidth: width})}
                    />
                </ImageZoom>
            </View>
        );
    }
}

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
