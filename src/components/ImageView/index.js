import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Pressable,
} from 'react-native';
import styles, {getZoomCursorStyle, getZoomSizingStyle} from '../../styles/styles';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import compose from '../../libs/compose';

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
        this.state = {
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
            imageLeft: 0,
            imageTop: 0,
            imageRight: 0,
            imageBottom: 0,
        };
    }

    componentDidMount() {
        if (this.canUseTouchScreen) {
            return;
        }
        Image.getSize(this.props.url, (width, height) => {
            const scale = Math.max(this.props.windowWidth / width, this.props.windowHeight / height);
            this.setImageRegion(width, height, scale);
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
     * When open image, set image left/right/top/bottom point and width, height
     * @param {Boolean} width image width
     * @param {Boolean} height image height
     * @param {Boolean} scale zoomscale when click zoom
     */
    setImageRegion(width, height, scale) {
        let imgLeft = (this.props.windowWidth - width) / 2;
        let imgRight = ((this.props.windowWidth - width) / 2) + width;
        let imgTop = (this.props.windowHeight - height) / 2;
        let imgBottom = ((this.props.windowHeight - height) / 2) + height;
        const isScreenWiderThanImage = (this.props.windowWidth / width) > 1;
        const isScreenTallerThanImage = (this.props.windowHeight / height) > 1;
        const aspect = width / height;
        if (aspect > 1 && !isScreenWiderThanImage) {
            // In case Width fit Screen width and Height not fit the Screen height
            const fitRate = this.props.windowWidth / width;
            imgLeft = 0;
            imgRight = this.props.windowWidth;
            imgTop = (this.props.windowHeight - (fitRate * height)) / 2;
            imgBottom = imgTop + (fitRate * height);
        } else if (aspect <= 1 && !isScreenTallerThanImage) {
            // In case Height fit Screen height and Width not fit the Screen width
            const fitRate = this.props.windowHeight / height;
            imgTop = 0;
            imgBottom = this.props.windowHeight;
            imgLeft = (this.props.windowWidth - (fitRate * width)) / 2;
            imgRight = imgLeft + (fitRate * width);
        }

        this.setState({
            imgWidth: width, imgHeight: height, zoomScale: scale, imageLeft: imgLeft, imageTop: imgTop, imageRight: imgRight, imageBottom: imgBottom,
        });
    }

    /**
     * Convert touch point to zoomed point
     * @param {Boolean} x x point when click zoom
     * @param {Boolean} y y point when click zoom
     * @returns {Object} converted touch point
     */
    getScrollOffset(x, y) {
        let fitRatio = 1;
        if (this.state.imageTop === 0) {
            // Fit Height
            fitRatio = this.props.windowHeight / this.state.imgHeight;
        } else if (this.state.imageLeft === 0) {
            // Fit Width
            fitRatio = this.props.windowWidth / this.state.imgWidth;
        }
        let sx = (x - this.state.imageLeft) / fitRatio;
        let sy = (y - this.state.imageTop) / fitRatio;

        // White blank touch
        if (x < this.state.imageLeft) {
            sx = 0;
        }
        if (x > this.state.imageRight) {
            sx = this.state.imgWidth;
        }
        if (y < this.state.imageTop) {
            sy = 0;
        }
        if (y > this.state.imageBottom) {
            sy = this.state.imgHeight;
        }
        return {offsetX: sx, offsetY: sy};
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
                        resizeMode="center"
                    />
                </View>
            );
        }

        return (
            <View
                ref={el => this.scrollableRef = el}
                style={[
                    styles.imageViewContainer,
                    styles.overflowScroll,
                    styles.noScrollbars,
                ]}
            >
                <Pressable
                    style={[
                        styles.w100,
                        styles.h100,
                        styles.flex1,
                        getZoomCursorStyle(this.state.isZoomed, this.state.isDragging),
                    ]}
                    onPressIn={(e) => {
                        const {pageX, pageY} = e.nativeEvent;
                        this.setState({
                            isMouseDown: true,
                            initialX: pageX,
                            initialY: pageY,
                            initialScrollLeft: this.scrollableRef.scrollLeft,
                            initialScrollTop: this.scrollableRef.scrollTop,
                        });
                    }}
                    onPress={(e) => {
                        if (this.state.isZoomed && !this.state.isDragging) {
                            const {offsetX, offsetY} = e.nativeEvent;
                            const delta = this.getScrollOffset(offsetX, offsetY);
                            const sX = delta.offsetX;
                            const sY = delta.offsetY;
                            this.scrollableRef.scrollTop = sY * this.state.zoomScale;
                            this.scrollableRef.scrollLeft = sX * this.state.zoomScale;
                        }

                        if (this.state.isZoomed && this.state.isDragging && this.state.isMouseDown) {
                            this.setState({isDragging: false, isMouseDown: false});
                        }
                    }}
                    onPressOut={() => {
                        if (this.state.isDragging) {
                            return;
                        }

                        this.setState(prevState => ({
                            isZoomed: !prevState.isZoomed,
                            isMouseDown: false,
                        }));
                    }}
                >
                    <Image
                        source={{uri: this.props.url}}
                        style={getZoomSizingStyle(this.state.isZoomed, this.state.imgWidth, this.state.imgHeight, this.state.zoomScale)}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        );
    }
}

ImageView.propTypes = propTypes;
export default compose(
    withWindowDimensions,
)(ImageView);
