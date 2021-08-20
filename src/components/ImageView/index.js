import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View, Image, Pressable} from 'react-native';
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
            imgHeight: 0
        };
    }

    componentDidMount() {
        if (this.canUseTouchScreen) {
            return;
        }
        Image.getSize(this.props.url, (width,height) => {
            this.setState({imgWidth:width,imgHeight:height});
        });
        document.addEventListener('mousemove', this.trackMovement.bind(this));
    }

    componentWillUnmount() {
        if (this.canUseTouchScreen) {
            return;
        }

        document.removeEventListener('mousemove', this.trackMovement.bind(this));
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
                            this.scrollableRef.scrollTop = offsetY * 1.5;
                            this.scrollableRef.scrollLeft = offsetX * 1.5;
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
                        style={getZoomSizingStyle(this.state.isZoomed,this.state.imgWidth,this.state.imgHeight)}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        );
    }
}

ImageView.propTypes = propTypes;
export default ImageView;
