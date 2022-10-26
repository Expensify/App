import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';

const propTypes = {
    /** handles onPress events with a callback  */
    onPress: PropTypes.func,

    /** can handle the cycling of attachments */
    onCycleThroughAttachments: PropTypes.func,

    /** can be set to provide styles */
    styles: PropTypes.arrayOf(PropTypes.shape({})),

    /** Children to render. */
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]).isRequired,
};

const defaultProps = {
    styles: [],
    onPress: () => {},
    onCycleThroughAttachments: () => {},
};

class Carousel extends React.Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            this.props.onCycleThroughAttachments(-1);
        }
        if (e.key === 'ArrowRight') {
            this.props.onCycleThroughAttachments(1);
        }
    }

    render() {
        return (
            <Pressable style={this.props.styles} onPress={this.props.onPress}>
                {this.props.children}
            </Pressable>
        );
    }
}

Carousel.propTypes = propTypes;
Carousel.defaultProps = defaultProps;

export default Carousel;
