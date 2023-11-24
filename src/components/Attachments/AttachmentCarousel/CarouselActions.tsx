import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';

type CarouselActionsProps = {
    onCycleThroughAttachments: (direction: number) => void;
};

const shortcutLeftConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT;
const shortcutRightConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT;

function CarouselActions({onCycleThroughAttachments}: CarouselActionsProps) {
    useKeyboardShortcut(shortcutLeftConfig, (e) => {
        const target = e?.target as HTMLElement;
        // prevents focus from highlighting around the modal
        target?.blur();

        onCycleThroughAttachments(-1);
    });

    useKeyboardShortcut(shortcutRightConfig, (e) => {
        const target = e?.target as HTMLElement;
        // prevents focus from highlighting around the modal
        target?.blur();

        onCycleThroughAttachments(1);
    });

    return null;
}

CarouselActions.displayName = 'CarouselActions';

export default CarouselActions;
