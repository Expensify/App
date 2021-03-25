import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View, Image, Pressable} from 'react-native';
import styles, {getZoomCursorStyle, getZoomSizingStyle} from '../../styles/styles';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,
};

class ImageView extends PureComponent {
    constructor(props) {
        super(props);
        this.scrollableRef = null;
        this.state = {
            isZoomed: false,
            isDragging: false,
            isMouseDown: false,
            x: 0,
            y: 0,
        };
    }

    componentDidMount() {
        document.addEventListener('mousemove', this.trackMouseMove.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.trackMouseMove.bind(this));
    }

    trackMouseMove() {
        if (!this.state.isMouseDown) {
            return;
        }

        this.setState({isDragging: true});
    }

    render() {
        return (
            <View
                ref={el => this.scrollableRef = el}
                style={[
                    styles.w100,
                    styles.h100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
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
                    onPressIn={() => {
                        console.log('on press in');
                        this.setState({
                            isDragging: false,
                            isMouseDown: true,
                        });
                    }}
                    onPress={(e) => {
                        if (!this.state.isMouseDown) {
                            return;
                        }

                        const {offsetX, offsetY} = e.nativeEvent;
                        this.setState({
                            x: offsetX * 1.5,
                            y: offsetY * 1.5,
                        }, () => {
                            this.scrollableRef.scrollTo(this.state.x, this.state.y);
                        });
                    }}
                    onPressOut={() => {
                        console.log('on press out');
                        if (this.state.isDragging) {
                            this.setState({isDragging: false, isMouseDown: false});
                            return;
                        }

                        this.setState(prevState => ({
                            isZoomed: !prevState.isZoomed,
                        }));
                    }}
                >
                    <Image
                        source={{uri: this.props.url}}
                        style={getZoomSizingStyle(this.state.isZoomed)}
                        resizeMode="center"
                    />
                </Pressable>
            </View>
        );
    }
}

ImageView.propTypes = propTypes;
export default ImageView;
