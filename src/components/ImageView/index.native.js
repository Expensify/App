import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View, PanResponder} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import _ from 'underscore';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import styles, {getWidthAndHeightStyle} from '../../styles/styles';
import variables from '../../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    /** URL to full-sized image */
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

        // Use the default double click interval from the ImageZoom library
        // https://github.com/ascoders/react-native-image-zoom/blob/master/src/image-zoom/image-zoom.type.ts#L79
        this.doubleClickInterval = 175;
        this.imageZoomScale = 1;
        this.lastClickTime = 0;
        this.amountOfTouches = 0;

        // PanResponder used to capture how many touches are active on the attachment image
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.updatePanResponderTouches.bind(this),
        });
    }

    /**
     * Updates the amount of active touches on the PanResponder on our ImageZoom overlay View
     *
     * @param {Event} e
     * @param {GestureState} gestureState
     * @returns {Boolean}
     */
    updatePanResponderTouches(e, gestureState) {
        if (_.isNumber(gestureState.numberActiveTouches)) {
            this.amountOfTouches = gestureState.numberActiveTouches;
        }

        // We don't need to set the panResponder since all we care about is checking the gestureState, so return false
        return false;
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
                    ref={el => this.zoom = el}
                    cropWidth={this.props.windowWidth}
                    cropHeight={windowHeight}
                    imageWidth={this.state.imageWidth}
                    imageHeight={this.state.imageHeight}
                    onStartShouldSetPanResponder={() => {
                        const isDoubleClick = new Date().getTime() - this.lastClickTime <= this.doubleClickInterval;
                        this.lastClickTime = new Date().getTime();

                        // Let ImageZoom handle the event if the tap is more than one touchPoint or if we are zoomed in
                        if (this.amountOfTouches === 2 || this.imageZoomScale !== 1) {
                            return true;
                        }

                        // When we have a double click and the zoom scale is 1 then programmatically zoom the image
                        // but let the tap fall through to the parent so we can register a swipe down to dismiss
                        if (isDoubleClick) {
                            this.zoom.centerOn({
                                x: 0,
                                y: 0,
                                scale: 2,
                                duration: 100,
                            });
                        }

                        // We must be either swiping down or double tapping since we are at zoom scale 1
                        return false;
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
                    {/**
                     Create an invisible view on top of the image so we can capture and set the amount of touches before
                     the ImageZoom's PanResponder does. Children will be triggered first, so this needs to be inside the
                     ImageZoom to work
                     */}
                    <View
                        /* eslint-disable-next-line react/jsx-props-no-spreading */
                        {...this.panResponder.panHandlers}
                        style={[
                            styles.w100,
                            styles.h100,
                            styles.invisible,
                        ]}
                    />
                </ImageZoom>
            </View>
        );
    }
}

ImageView.propTypes = propTypes;
ImageView.displayName = 'ImageView';

export default withWindowDimensions(ImageView);
