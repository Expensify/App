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
        };
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
                        getZoomCursorStyle(this.state.isZoomed),
                    ]}
                    onPress={(e) => {
                        const {offsetX, offsetY} = e.nativeEvent;
                        this.setState(prevState => ({
                            isZoomed: !prevState.isZoomed,
                        }), () => {
                            this.scrollableRef.scrollTo(offsetX, offsetY);
                        });
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
