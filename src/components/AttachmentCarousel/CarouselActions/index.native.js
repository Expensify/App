import React from 'react';
import PropTypes from 'prop-types';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import CONST from '../../../CONST';

const propTypes = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: PropTypes.func.isRequired,
};

class Carousel extends React.Component {
    componentDidMount() {
        const shortcutLeftConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT;
        this.unsubscribeLeftKey = KeyboardShortcut.subscribe(
            shortcutLeftConfig.shortcutKey,
            () => {
                this.props.onCycleThroughAttachments(-1);
            },
            shortcutLeftConfig.descriptionKey,
            shortcutLeftConfig.modifiers,
        );

        const shortcutRightConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT;
        this.unsubscribeLeftKey = KeyboardShortcut.subscribe(
            shortcutRightConfig.shortcutKey,
            () => {
                this.props.onCycleThroughAttachments(1);
            },
            shortcutRightConfig.descriptionKey,
            shortcutRightConfig.modifiers,
        );
    }

    componentWillUnmount() {
        if (this.unsubscribeLeftKey) {
            this.unsubscribeLeftKey();
        }
        if (this.unsubscribeLeftKey) {
            this.unsubscribeLeftKey();
        }
    }

    render() {
        // This component is only used to listen for keyboard events
        return null;
    }
}

Carousel.propTypes = propTypes;

export default Carousel;
