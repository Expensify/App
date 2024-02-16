import {useEffect} from 'react';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

type CarouselActionsProps = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: (deltaSlide: number) => void;
};

function CarouselActions({onCycleThroughAttachments}: CarouselActionsProps) {
    useEffect(() => {
        const shortcutLeftConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT;
        const unsubscribeLeftKey = KeyboardShortcut.subscribe(
            shortcutLeftConfig.shortcutKey,
            () => {
                onCycleThroughAttachments(-1);
            },
            shortcutLeftConfig.descriptionKey,
            shortcutLeftConfig.modifiers,
        );

        const shortcutRightConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT;
        const unsubscribeRightKey = KeyboardShortcut.subscribe(
            shortcutRightConfig.shortcutKey,
            () => {
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

export default CarouselActions;
