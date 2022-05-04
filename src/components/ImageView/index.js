import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Pressable,
} from 'react-native';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';

const propTypes = {
    /** URL to full-sized image */
    url: PropTypes.string.isRequired,
    ...windowDimensionsPropTypes,
};

class ImageView extends PureComponent {
    constructor(props) {
        super(props);
        this.scrollableRef = null;
        this.canUseTouchScreen = canUseTouchScreen();
        this.onContainerLayoutChanged = this.onContainerLayoutChanged.bind(this);
        this.onContainerPressIn = this.onContainerPressIn.bind(this);
        this.onContainerPress = this.onContainerPress.bind(this);
        this.onContainerPressOut = this.onContainerPressOut.bind(this);
        this.imageLoadingStart = this.imageLoadingStart.bind(this);
        this.imageLoadingEnd = this.imageLoadingEnd.bind(this);
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
        Image.getSize(this.props.url, (width, height) => {
            this.setImageRegion(width, height);
        });
        document.addEventListener('mousemove', this.trackMovement.bind(this));
    }

    componentWillUnmount() {
        if (this.canUseTouchScreen) {
            return;
        }

        document.removeEventListener('mousemove', this.trackMovement.bind(this));
    }

    /**
     * @param {SyntheticEvent} e
     */
    onContainerLayoutChanged(e) {
        const {width, height} = e.nativeEvent.layout;
        const imageWidth = this.state.imgWidth;
        const imageHeight = this.state.imgHeight;
        const scale = imageHeight && imageWidth ? Math.min(width / imageWidth, height / imageHeight) : 0;
        this.setState({
            containerHeight: height,
            containerWidth: width,
            zoomScale: scale,
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
        if (this.isZoomed && !this.state.isDragging) {
            const {offsetX, offsetY} = e.nativeEvent;
            const delta = this.getScrollOffset(offsetX / this.state.zoomScale, offsetY / this.state.zoomScale);
            scrollX = delta.offsetX;
            scrollY = delta.offsetY;
        }

        if (this.isZoomed && this.state.isDragging && this.state.isMouseDown) {
            this.setState({isDragging: false, isMouseDown: false});
        } else if (this.isZoomed) {
            this.setState({isZoomed: this.isZoomed}, () => {
                this.scrollableRef.scrollTop = scrollY;
                this.scrollableRef.scrollLeft = scrollX;
            });
        }
    }

    onContainerPressOut() {
        if (this.state.isDragging) {
            return;
        }

        this.isZoomed = !this.state.isZoomed;
        if (this.isZoomed === false) {
            this.setState(prevState => ({
                isMouseDown: false,
                isZoomed: !prevState.isZoomed,
            }));
        } else {
            this.setState({
                isMouseDown: false,
            });
        }
    }

    /**
     * When open image, set image left/right/top/bottom point and width, height
     * @param {Number} imageWidth
     * @param {Number} imageHeight
     */
    setImageRegion(imageWidth, imageHeight) {
        if (imageHeight <= 0) {
            return;
        }
        const containerHeight = this.state.containerHeight;
        const containerWidth = this.state.containerWidth;
        const width = imageWidth;
        const height = imageHeight;
        const newZoomScale = Math.min(containerWidth / width, containerHeight / height);

        this.setState(prevState => ({
            imgWidth: width,
            imgHeight: height,
            zoomScale: containerHeight ? newZoomScale : prevState.zoomScale,
        }));
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
        if (x <= (this.state.containerWidth / 2)) {
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
                >
                    <Image
                        source={{uri: this.props.url}}
                        style={[
                            styles.w100,
                            styles.h100,
                        ]}
                        resizeMode="contain"
                        onLoadStart={this.imageLoadingStart}
                        onLoadEnd={this.imageLoadingEnd}
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
                    onPressOut={this.onContainerPressOut}
                >
                    <Image
                        source={{uri: this.props.url}}
                        style={[
                            styles.h100,
                            styles.w100,
                        ]}
                        resizeMode="contain"
                        onLoadStart={this.imageLoadingStart}
                        onLoadEnd={this.imageLoadingEnd}
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
export default withWindowDimensions(ImageView);
