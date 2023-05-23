import {useEffect} from 'react';
import PropTypes from 'prop-types';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import CONST from '../../../CONST';

const propTypes = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: PropTypes.func.isRequired,
};

const Carousel = (props) => {
    useEffect(() => {
        const shortcutLeftConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT;
        const unsubscribeLeftKey = KeyboardShortcut.subscribe(
            shortcutLeftConfig.shortcutKey,
            () => {
                props.onCycleThroughAttachments(-1);
            },
            shortcutLeftConfig.descriptionKey,
            shortcutLeftConfig.modifiers,
        );

        const shortcutRightConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT;
        const unsubscribeRightKey = KeyboardShortcut.subscribe(
            shortcutRightConfig.shortcutKey,
            () => {
                props.onCycleThroughAttachments(1);
            },
            shortcutRightConfig.descriptionKey,
            shortcutRightConfig.modifiers,
        );

        return () => {
            unsubscribeLeftKey();
            unsubscribeRightKey();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

Carousel.propTypes = propTypes;

export default Carousel;
