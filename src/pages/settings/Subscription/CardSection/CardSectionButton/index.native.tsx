import type {ButtonProps} from '@components/Button';
import ButtonIcon from '@components/Button/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/Button/primitives/ButtonKeyboardShortcut';
import ButtonText from '@components/Button/primitives/ButtonText';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CardSectionButtonBase(_props: ButtonProps) {
    return null;
}

const CardSectionButton = Object.assign(CardSectionButtonBase, {
    Icon: ButtonIcon,
    Text: ButtonText,
    KeyboardShortcut: ButtonKeyboardShortcut,
});

export default CardSectionButton;
