import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import styles, {getWidthAndHeightStyle} from '../../styles/styles';
import variables from '../../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
};

class ImageView extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 100,
            imageHeight: 100,
        };

        this.scaleValue = 1;
    }

    render() {
        // Default windowHeight accounts for the modal header height
        const windowHeight = this.props.windowHeight - variables.contentHeaderHeight;
        return (
            <View
                style={[
                    styles.w100,
                    styles.h100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    styles.overflowHidden,
                ]}
            >
                <ImageZoom
                    cropWidth={this.props.windowWidth}
                    cropHeight={windowHeight}
                    imageWidth={this.state.imageWidth}
                    imageHeight={this.state.imageHeight}
                    onStartShouldSetPanResponder={e => e.nativeEvent.touches.length === 2 || this.scaleValue !== 1}
                    onMove={({scale}) => {
                        this.scaleValue = scale;
                    }}
                >
                    <ImageWithSizeCalculation
                        style={getWidthAndHeightStyle(this.state.imageWidth, this.state.imageHeight)}
                        url={this.props.url}
                        onMeasure={({width, height}) => {
                            let imageWidth = width;
                            let imageHeight = height;

                            if (width > this.props.windowWidth || height > windowHeight) {
                                const scaleFactor = Math.max(width / this.props.windowWidth, height / windowHeight);
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

export default withWindowDimensions(ImageView);
