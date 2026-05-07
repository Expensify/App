import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';

type CarouselActionsProps = {
    /** Callback to cycle through attachments */
    onCycleThroughAttachments: (deltaSlide: number) => void;
};

function CarouselActions({onCycleThroughAttachments}: CarouselActionsProps) {
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT,
        (event) => {
            if (event?.target instanceof HTMLElement) {
                // prevents focus from highlighting around the modal
                event.target.blur();
            }
            onCycleThroughAttachments(-1);
        },
        {captureOnInputs: false},
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT,
        (event) => {
            if (event?.target instanceof HTMLElement) {
                // prevents focus from highlighting around the modal
                event.target.blur();
            }
            onCycleThroughAttachments(1);
        },
        {captureOnInputs: false},
    );

    return null;
}

export default CarouselActions;
