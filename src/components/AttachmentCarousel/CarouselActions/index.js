import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: PropTypes.func.isRequired,
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
            this.props.onCycleThroughAttachments(-1);
        }
        if (e.key === 'ArrowRight') {
            this.props.onCycleThroughAttachments(1);
        }
    }

    render() {
        // This component is only used to listen for keyboard events
        return null;
    }
}

Carousel.propTypes = propTypes;

export default Carousel;
