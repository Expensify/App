import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ImageZoom, {ImageZoomProps} from 'react-native-image-pan-zoom';
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

        this.imageZoomScale = 1;
        this.doubleClickInterval = 1000;
        this.lastClickTime = 0;
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
                    onStartShouldSetPanResponder={(e) => {
                        // Let ImageZoom handle the event if the tap is more than one touchPoint or if we are zoomed in
                        if (e.nativeEvent.touches.length === 2 || this.imageZoomScale !== 1) {
                            console.log(`joetest returning true case 1`);
                            return true;
                        }

                        // If this isn't a double click, ignore the event to let the parent handle it
                        if (new Date().getTime() - this.lastClickTime >= (this.doubleClickInterval || 0)) {
                            console.log(`joetest returning false case 2. lastClickTime: ${this.lastClickTime}`);
                            this.lastClickTime = new Date().getTime();
                            return false;
                        }

                        // This is a double click, reset the lastClickTime and let ImageZoom handle the event
                        console.log(`joetest returning true case 3`);
                        return true;
                    }}
                    onMove={({scale}) => {
                        this.imageZoomScale = scale;
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
