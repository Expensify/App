import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, InteractionManager, PanResponder,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import _ from 'underscore';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';
import Image from '../Image';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized image */
    url: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isAuthTokenRequired: false,
};

class ImageView extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,

            // Default to large image width and height to prevent
            // small, blurry image being present by react-native-image-pan-zoom
            imageWidth: props.windowWidth,
            imageHeight: props.windowHeight,
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

        this.imageProgress = this.imageProgress.bind(this);
        this.imageLoad = this.imageLoad.bind(this);
    }

    componentWillUnmount() {
        if (!this.state.interactionPromise) {
            return;
        }
        this.state.interactionPromise.cancel();
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

    imageProgress() {
        this.setState({isLoading: true});
    }

    /**
     * Handles the `onLoad` event when the image loads providing the natural
     * image dimensions required for layout calculations
     *
     * @param {Object} nativeEvent
     */
    imageLoad({nativeEvent}) {
        // Wait till animations are over to prevent stutter in navigation animation
        this.state.interactionPromise = InteractionManager.runAfterInteractions(() => {
            let imageWidth = nativeEvent.width;
            let imageHeight = nativeEvent.height;
            const containerWidth = Math.round(this.props.windowWidth);
            const containerHeight = Math.round(this.state.containerHeight);

            const aspectRatio = Math.min(containerHeight / imageHeight, containerWidth / imageWidth);

            if (imageHeight > imageWidth) {
                imageHeight *= aspectRatio;
            } else {
                imageWidth *= aspectRatio;
            }

            // Resize the image to max dimensions possible on the Native platforms to prevent crashes on Android. To keep the same behavior, apply to IOS as well.
            const maxDimensionsScale = 11;
            imageHeight = Math.min(imageHeight, (this.props.windowHeight * maxDimensionsScale));
            imageWidth = Math.min(imageWidth, (this.props.windowWidth * maxDimensionsScale));
            this.setState({imageHeight, imageWidth, isLoading: false});
        });
    }

    render() {
        // Default windowHeight accounts for the modal header height
        const windowHeight = this.props.windowHeight - variables.contentHeaderHeight;

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
                onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    this.setState({
                        containerHeight: layout.height,
                    });
                }}
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

                            // Hide image while loading so ImageZoom can get the image
                            // size before presenting - preventing visual glitches or shift
                            // due to ImageZoom
                            this.state.isLoading ? styles.opacity0 : styles.opacity1,
                        ]}
                        source={{uri: this.props.url}}
                        isAuthTokenRequired={this.props.isAuthTokenRequired}
                        resizeMode={Image.resizeMode.contain}
                        onProgress={this.imageProgress}
                        onLoad={this.imageLoad}
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
ImageView.defaultProps = defaultProps;

export default withWindowDimensions(ImageView);
