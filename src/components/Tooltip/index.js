import React from 'react';
import PropTypes from 'prop-types';
import {
    Modal, Pressable, Text, View
} from 'react-native';

import Triangle from './Triangle';
import styles from './styles';

const propTypes = {
    textContent: PropTypes.string.isRequired,
};

class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        // The outermost view rendered by this component
        this.renderedContent = null;
        this.wrappedElementWidth = 0;
        this.wrappedElementHeight = 0;

        // The distance between the left side of the rendered view and the left side of the window
        this.xOffset = 0;

        // The distance between the top of the rendered view and the top of the window
        this.yOffset = 0;
    }

    getPosition() {
        this.renderedContent.measureInWindow((x, y, width, height) => {
            this.xOffset = x;
            this.yOffset = y;
            this.wrappedElementWidth = width;
            this.wrappedElementHeight = height;
        });
    }

    render() {
        const toolTipStyle = styles.getTooltipStyle(
            this.wrappedElementWidth,
            this.wrappedElementHeight,
            this.xOffset,
            this.yOffset,
        );
        const {pointerWrapperViewStyle, shouldPointDown} = styles.getPointerStyle(
            this.wrappedElementWidth,
            this.wrappedElementHeight,
            this.xOffset,
            this.yOffset,
            toolTipStyle.top,
        );

        return (
            <View
                ref={e => (this.renderedContent = e)}
                onLayout={e => (this.getPosition(e))}
                collapsable={false}
            >
                <Pressable>
                    {({hovered}) => (
                        <View>
                            {this.props.children}
                            <Modal
                                animationType="fade"
                                visible={hovered}
                                transparent
                            >
                                <View style={pointerWrapperViewStyle}>
                                    <Triangle isPointingDown={shouldPointDown} />
                                </View>
                                <View style={toolTipStyle}>
                                    <Text style={styles.tooltipText}>{this.props.textContent}</Text>
                                </View>
                            </Modal>
                        </View>
                    )}
                </Pressable>
            </View>
        );
    }
}

Tooltip.propTypes = propTypes;
export default Tooltip;
