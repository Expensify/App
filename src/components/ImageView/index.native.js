import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import styles from '../../styles/StyleSheet';
import variables from '../../styles/variables';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,
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
                        style={{
                            width: this.state.imageWidth,
                            height: this.state.imageHeight,
                        }}
                        url={this.props.url}
                        onMeasure={({width, height}) => {
                            let imageWidth = width;
                            let imageHeight = height;

                            if (width > windowWidth || height > windowHeight) {
                                const scaleFactor = Math.max(width / windowWidth, height / windowHeight);
                                imageHeight = height / scaleFactor;
                                imageWidth = width / scaleFactor;
                            }

                            this.setState({imageHeight, imageWidth});
                        }}
                    />
                </ImageZoom>
            </View>
        );
    }
}

ImageView.propTypes = propTypes;
ImageView.displayName = 'ImageView';

export default ImageView;
