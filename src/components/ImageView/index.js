import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Pressable, Dimensions,
} from 'react-native';
import styles, {getZoomCursorStyle, getZoomSizingStyle} from '../../styles/styles';
import canUseTouchScreen from '../../libs/canUseTouchscreen';

const propTypes = {
    /** URL to full-sized image */
    url: PropTypes.string.isRequired,
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
            screenWidth: 0,
            screenHeight: 0,
            zoomScale: 0,
            rX1: 0,
            rY1: 0,
            rX2: 0,
            rY2: 0,
        };
    }

    componentDidMount() {
        if (this.canUseTouchScreen) {
            return;
        }
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        this.setState({screenWidth: windowWidth, screenHeight: windowHeight});
        Image.getSize(this.props.url, (width, height) => {
            const scale = Math.max(this.state.screenWidth / width, this.state.screenHeight / height);
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

    setImageRegion(width, height, scale) {
        let x1 = 0;
        let x2 = 0;
        let y1 = 0;
        let y2 = 0;
        const aspect = width / height;
        if ((aspect > 1 && this.state.screenWidth / width > 1) || (aspect <= 1 && this.state.screenHeight / height > 1)) {
            x1 = (this.state.screenWidth - width) / 2;
            x2 = ((this.state.screenWidth - width) / 2) + width;
            y1 = (this.state.screenHeight - height) / 2;
            y2 = ((this.state.screenHeight - height) / 2) + height;
        } else if (aspect > 1 && this.state.screenWidth / width <= 1) {
            const rate = this.state.screenWidth / width;
            x2 = this.state.screenWidth;
            y1 = (this.state.screenHeight - (rate * height)) / 2;
            y2 = y1 + (rate * height);
        } else if (aspect <= 1 && this.state.screenHeight / height <= 1) {
            const rate = this.state.screenHeight / height;
            y2 = this.state.screenHeight;
            x1 = (this.state.screenWidth - (rate * width)) / 2;
            x2 = x1 + (rate * width);
        }
        this.setState({
            imgWidth: width, imgHeight: height, zoomScale: scale, rX1: x1, rY1: y1, rX2: x2, rY2: y2,
        });
    }

    getScrollOffset(x, y) {
        let ratio = 1;
        if (this.state.rY1 === 0) {
            ratio = this.state.screenHeight / this.state.imgHeight;
        } else if (this.state.rX1 === 0) {
            ratio = this.state.screenWidth / this.state.imgWidth;
        }
        let sx = (x - this.state.rX1) / ratio;
        let sy = (y - this.state.rY1) / ratio;
        if (x < this.state.rX1) {
            sx = 0;
        }
        if (x > this.state.rX2) {
            sx = this.state.imgWidth;
        }
        if (y < this.state.rY1) {
            sy = 0;
        }
        if (y > this.state.rY2) {
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
export default ImageView;
