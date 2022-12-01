import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, Pressable,
} from 'react-native';
import Image from '../Image';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';

const propTypes = {

    /** Do the urls require an authToken? */
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
        this.scrollableRef = null;
        this.canUseTouchScreen = canUseTouchScreen();
        this.onContainerLayoutChanged = this.onContainerLayoutChanged.bind(this);
        this.onContainerPressIn = this.onContainerPressIn.bind(this);
        this.onContainerPress = this.onContainerPress.bind(this);
        this.imageLoad = this.imageLoad.bind(this);
        this.imageLoadingStart = this.imageLoadingStart.bind(this);
        this.imageLoadingEnd = this.imageLoadingEnd.bind(this);
        this.trackMovement = this.trackMovement.bind(this);
        this.trackPointerPosition = this.trackPointerPosition.bind(this);

        this.state = {
            isLoading: false,
            containerHeight: 0,
            containerWidth: 0,
            isZoomed: false,
            isDragging: false,
            isMouseDown: false,
            initialScrollLeft: 0,
            initialScrollTop: 0,
            initialX: 0,
            initialY: 0,
            imgWidth: 0,
            imgHeight: 0,
            zoomScale: 0,
        };
    }

    componentDidMount() {
        if (this.canUseTouchScreen) {
            return;
        }
        document.addEventListener('mousemove', this.trackMovement);
        document.addEventListener('mouseup', this.trackPointerPosition);
    }

    componentWillUnmount() {
        if (this.canUseTouchScreen) {
            return;
        }

        document.removeEventListener('mousemove', this.trackMovement);
        document.removeEventListener('mouseup', this.trackPointerPosition);
    }

    /**
     * @param {SyntheticEvent} e
     */
    onContainerLayoutChanged(e) {
        const {width, height} = e.nativeEvent.layout;
        this.setScale(width, height, this.state.imgWidth, this.state.imgHeight);
        this.setState({
            containerHeight: height,
            containerWidth: width,
        });
    }

    /**
     * @param {SyntheticEvent} e
     */
    onContainerPressIn(e) {
        const {pageX, pageY} = e.nativeEvent;
        this.setState({
            isMouseDown: true,
            initialX: pageX,
            initialY: pageY,
            initialScrollLeft: this.scrollableRef.scrollLeft,
            initialScrollTop: this.scrollableRef.scrollTop,
        });
    }

    /**
     * @param {SyntheticEvent} e
     */
    onContainerPress(e) {
        let scrollX;
        let scrollY;
        if (!this.state.isZoomed && !this.state.isDragging) {
            const {offsetX, offsetY} = e.nativeEvent;

            // Dividing clicked positions by the zoom scale to get coordinates
            // so that once we zoom we will scroll to the clicked location.
            const delta = this.getScrollOffset(offsetX / this.state.zoomScale, offsetY / this.state.zoomScale);
            scrollX = delta.offsetX;
            scrollY = delta.offsetY;
        }

        if (this.state.isZoomed && this.state.isDragging && this.state.isMouseDown) {
            this.setState({isDragging: false, isMouseDown: false});
        } else {
            // We first zoom and once its done then we scroll to the location the user clicked.
            this.setState(prevState => ({
                isZoomed: !prevState.isZoomed,
                isMouseDown: false,
            }), () => {
                this.scrollableRef.scrollTop = scrollY;
                this.scrollableRef.scrollLeft = scrollX;
            });
        }
    }

    /**
     * When open image, set image width, height.
     * @param {Number} imageWidth
     * @param {Number} imageHeight
     */
    setImageRegion(imageWidth, imageHeight) {
        if (imageHeight <= 0) {
            return;
        }

        this.setScale(this.state.containerWidth, this.state.containerHeight, imageWidth, imageHeight);
        this.setState({
            imgWidth: imageWidth,
            imgHeight: imageHeight,
        });
    }

    /**
     * @param {Number} containerWidth
     * @param {Number} containerHeight
     * @param {Number} imageWidth
     * @param {Number} imageHeight
     */
    setScale(containerWidth, containerHeight, imageWidth, imageHeight) {
        if (!containerWidth || !imageWidth || !containerHeight || !imageHeight) {
            return;
        }
        const newZoomScale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
        this.setState({zoomScale: newZoomScale});
    }

    /**
     * Convert touch point to zoomed point
     * @param {Boolean} x x point when click zoom
     * @param {Boolean} y y point when click zoom
     * @returns {Object} converted touch point
     */
    getScrollOffset(x, y) {
        let offsetX;
        let offsetY;

        // Container size bigger than clicked position offset
        if (x <= this.state.containerWidth / 2) {
            offsetX = 0;
        } else if (x > this.state.containerWidth / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetX = x - (this.state.containerWidth / 2);
        }
        if (y <= this.state.containerHeight / 2) {
            offsetY = 0;
        } else if (y > this.state.containerHeight / 2) {
            // Minus half of container size because we want to be center clicked position
            offsetY = y - (this.state.containerHeight / 2);
        }
        return {offsetX, offsetY};
    }

    /**
     * @param {SyntheticEvent} e
     */
    trackPointerPosition(e) {
        // Whether the pointer is released inside the ImageView
        const isInsideImageView = this.scrollableRef.contains(e.nativeEvent.target);

        if (!isInsideImageView && this.state.isZoomed && this.state.isDragging && this.state.isMouseDown) {
            this.setState({isDragging: false, isMouseDown: false});
        }
    }

    trackMovement(e) {
        if (!this.state.isZoomed) {
            return;
        }

        if (this.state.isDragging && this.state.isMouseDown) {
            const x = e.nativeEvent.x;
            const y = e.nativeEvent.y;
            const moveX = this.state.initialX - x;
            const moveY = this.state.initialY - y;
            this.scrollableRef.scrollLeft = this.state.initialScrollLeft + moveX;
            this.scrollableRef.scrollTop = this.state.initialScrollTop + moveY;
        }

        this.setState(prevState => ({isDragging: prevState.isMouseDown}));
    }

    imageLoad({nativeEvent}) {
        this.setImageRegion(nativeEvent.width, nativeEvent.height);
    }

    imageLoadingStart() {
        this.setState({isLoading: true});
    }

    imageLoadingEnd() {
        this.setState({isLoading: false});
    }

    render() {
        if (this.canUseTouchScreen) {
            return (
                <View
                    style={[styles.imageViewContainer, styles.overflowHidden]}
                    onLayout={this.onContainerLayoutChanged}
                >
                    <Image
                        source={{uri: this.props.url}}
                        isAuthTokenRequired={this.props.isAuthTokenRequired}
                        style={this.state.zoomScale === 0 ? undefined : [
                            styles.w100,
                            styles.h100,
                        ]} // Hide image until zoomScale calculated to prevent showing preview with wrong dimensions.

                        // When Image dimensions are lower than the container boundary(zoomscale <= 1), use `contain` to render the image with natural dimensions.
                        // Both `center` and `contain` keeps the image centered on both x and y axis.
                        resizeMode={this.state.zoomScale > 1 ? Image.resizeMode.center : Image.resizeMode.contain}
                        onLoadStart={this.imageLoadingStart}
                        onLoadEnd={this.imageLoadingEnd}
                        onLoad={this.imageLoad}
                    />
                    {this.state.isLoading && (
                        <FullscreenLoadingIndicator
                            style={[styles.opacity1, styles.bgTransparent]}
                        />
                    )}
                </View>
            );
        }
        return (
            <View
                ref={el => this.scrollableRef = el}
                onLayout={this.onContainerLayoutChanged}
                style={[
                    styles.imageViewContainer,
                    styles.overflowScroll,
                    styles.noScrollbars,
                    styles.pRelative,
                ]}
            >
                <Pressable
                    style={{
                        ...StyleUtils.getZoomSizingStyle(this.state.isZoomed, this.state.imgWidth, this.state.imgHeight, this.state.zoomScale,
                            this.state.containerHeight, this.state.containerWidth),
                        ...StyleUtils.getZoomCursorStyle(this.state.isZoomed, this.state.isDragging),
                        ...this.state.isZoomed && this.state.zoomScale >= 1 ? styles.pRelative : styles.pAbsolute,
                        ...styles.flex1,
                    }}
                    onPressIn={this.onContainerPressIn}
                    onPress={this.onContainerPress}
                >
                    <Image
                        source={{uri: this.props.url}}
                        isAuthTokenRequired={this.props.isAuthTokenRequired}
                        style={this.state.zoomScale === 0 ? undefined : [
                            styles.h100,
                            styles.w100,
                        ]} // Hide image until zoomScale calculated to prevent showing preview with wrong dimensions.
                        resizeMode={Image.resizeMode.contain}
                        onLoadStart={this.imageLoadingStart}
                        onLoadEnd={this.imageLoadingEnd}
                        onLoad={this.imageLoad}
                    />
                </Pressable>

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
