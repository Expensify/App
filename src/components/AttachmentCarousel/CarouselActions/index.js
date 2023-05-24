import {useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: PropTypes.func.isRequired,
};

const Carousel = (props) => {
    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    const handleKeyPress = useCallback((e) => {
        // prevents focus from highlighting around the modal
        e.target.blur();

        if (e.key === 'ArrowLeft') {
            props.onCycleThroughAttachments(-1);
        }
        if (e.key === 'ArrowRight') {
            props.onCycleThroughAttachments(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

Carousel.propTypes = propTypes;

export default Carousel;
