import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';

const propTypes = {
    /** Handles onPress events with a callback  */
    onPress: PropTypes.func.isRequired,

    /** Callback to cycle through attachments */
    onCycleThroughAttachments: PropTypes.func.isRequired,

    /** Styles to be assigned to Carousel */
    styles: PropTypes.arrayOf(PropTypes.shape({})).isRequired,

    /** Children to render */
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]).isRequired,
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
        // prevents focus from highlighting around the modal
        e.target.blur();
        if (e.key === 'ArrowLeft') {
            this.props.onCycleThroughAttachments(1);
        }
        if (e.key === 'ArrowRight') {
            this.props.onCycleThroughAttachments(-1);
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

export default Carousel;
