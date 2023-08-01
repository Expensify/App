import {useEffect} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import CONST from '../../../CONST';

const propTypes = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: PropTypes.func.isRequired,
};

function CarouselActions({onCycleThroughAttachments}) {
    useEffect(() => {
        const shortcutLeftConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT;
        const unsubscribeLeftKey = KeyboardShortcut.subscribe(
            shortcutLeftConfig.shortcutKey,
            (e) => {
                if (lodashGet(e, 'target.blur')) {
                    // prevents focus from highlighting around the modal
                    e.target.blur();
                }

                onCycleThroughAttachments(-1);
            },
            shortcutLeftConfig.descriptionKey,
            shortcutLeftConfig.modifiers,
        );

        const shortcutRightConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT;
        const unsubscribeRightKey = KeyboardShortcut.subscribe(
            shortcutRightConfig.shortcutKey,
            (e) => {
                if (lodashGet(e, 'target.blur')) {
                    // prevents focus from highlighting around the modal
                    e.target.blur();
                }

                onCycleThroughAttachments(1);
            },
            shortcutRightConfig.descriptionKey,
            shortcutRightConfig.modifiers,
        );

        return () => {
            unsubscribeLeftKey();
            unsubscribeRightKey();
        };
    }, [onCycleThroughAttachments]);

    return null;
}

CarouselActions.propTypes = propTypes;

export default CarouselActions;
