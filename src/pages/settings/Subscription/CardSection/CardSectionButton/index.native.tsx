import type {ButtonProps} from '@components/ButtonComposed';
import ButtonIcon from '@components/ButtonComposed/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import ButtonText from '@components/ButtonComposed/primitives/ButtonText';

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
