import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import CONST from '@src/CONST';

type CarouselActionsProps = {
    /** Moves the carousel by the given number of attachments, returning whether it moved */
    onCycleThroughAttachments: (deltaSlide: number) => boolean;
};

function CarouselActions({onCycleThroughAttachments}: CarouselActionsProps) {
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT,
        (event) => {
            // Blur only when the carousel moves, so a focused PDF on the first attachment keeps scrolling with the keyboard
            if (!onCycleThroughAttachments(-1) || !(event?.target instanceof HTMLElement)) {
                return;
            }
            // prevents focus from highlighting around the modal
            event.target.blur();
        },
        {captureOnInputs: false},
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT,
        (event) => {
            // Blur only when the carousel moves, so a focused PDF on the last attachment keeps scrolling with the keyboard
            if (!onCycleThroughAttachments(1) || !(event?.target instanceof HTMLElement)) {
                return;
            }
            // prevents focus from highlighting around the modal
            event.target.blur();
        },
        {captureOnInputs: false},
    );

    return null;
}

export default CarouselActions;
