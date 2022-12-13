import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, InteractionManager, PanResponder,
} from 'react-native';
import Image from '@pieter-pot/react-native-fast-image';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageSize from 'react-native-image-size';
import _ from 'underscore';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';

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
            isLoading: false,
            imageWidth: undefined,
            imageHeight: undefined,
            interactionPromise: undefined,
            containerHeight: undefined,
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

        this.imageLoadingStart = this.imageLoadingStart.bind(this);
        this.imageLoadingEnd = this.imageLoadingEnd.bind(this);
    }

    componentDidMount() {
        // Wait till animations are over to prevent stutter in navigation animation
        this.state.interactionPromise = InteractionManager.runAfterInteractions(() => this.calculateImageSize());
    }

    componentWillUnmount() {
        if (!this.state.interactionPromise) {
            return;
        }
        this.state.interactionPromise.cancel();
    }

    calculateImageSize() {
        if (!this.props.url) {
            return;
        }
        ImageSize.getSize(this.props.url).then(({width, height, rotation}) => {
            let imageWidth = width;
            let imageHeight = height;
            const containerWidth = Math.round(this.props.windowWidth);
            const containerHeight = Math.round(this.state.containerHeight);

            // On specific Android devices, the dimensions are sometimes returned to us flipped here, with `rotation` set to 90 degrees.
            // Swap them back to make sure the image fits nicely in the container. On iOS, the rotation is always undefined, so this does not apply.
            if (rotation === 90 && imageWidth > imageHeight) {
                [imageWidth, imageHeight] = [imageHeight, imageWidth];
            }

            const aspectRatio = Math.min(containerHeight / imageHeight, containerWidth / imageWidth);

            imageHeight *= aspectRatio;
            imageWidth *= aspectRatio;

            // Resize the image to max dimensions possible on the Native platforms to prevent crashes on Android. To keep the same behavior, apply to IOS as well.
            const maxDimensionsScale = 11;
            imageHeight = Math.min(imageHeight, (this.props.windowHeight * maxDimensionsScale));
            imageWidth = Math.min(imageWidth, (this.props.windowWidth * maxDimensionsScale));
            this.setState({imageHeight, imageWidth});
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

    imageLoadingStart() {
        this.setState({isLoading: true});
    }

    imageLoadingEnd() {
        this.setState({isLoading: false});
    }

    render() {
        // Default windowHeight accounts for the modal header height
        const windowHeight = this.props.windowHeight - variables.contentHeaderHeight;

        // Display thumbnail until Image size calculation is complete
        if (!this.state.imageWidth || !this.state.imageHeight) {
            return (
                <View
                    style={[
                        styles.w100,
                        styles.h100,
                        styles.alignItemsCenter,
                        styles.justifyContentCenter,
                        styles.overflowHidden,
                        styles.errorOutline,
                    ]}
                    onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        this.setState({
                            containerHeight: layout.height,
                        });
                    }}
                >
                    <FullscreenLoadingIndicator
                        style={[styles.opacity1, styles.bgTransparent]}
                    />
                </View>
            );
        }

        // Zoom view should be loaded only after measuring actual image dimensions, otherwise it causes blurred images on Android
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
                    <Image
                        style={[
                            styles.w100,
                            styles.h100,
                            this.props.style,
                        ]}
                        source={{uri: this.props.url}}
                        resizeMode="contain"
                        onLoadStart={this.imageLoadingStart}
                        onLoadEnd={this.imageLoadingEnd}
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
                {this.state.isLoading && (
                    <FullscreenLoadingIndicator
                        style={[styles.opacity1, styles.bgTransparent]}
                    />
                )}
            </View>
        );
    }
}

ImageView.propTypes = propTypes;

export default withWindowDimensions(ImageView);
