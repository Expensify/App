import Button from '@components/ButtonComposed';
import type {ButtonProps} from '@components/ButtonComposed';
import ButtonIcon from '@components/ButtonComposed/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import ButtonText from '@components/ButtonComposed/primitives/ButtonText';

function CardSectionButtonBase(props: ButtonProps) {
    return <Button {...props} />;
}

const CardSectionButton = Object.assign(CardSectionButtonBase, {
    Icon: ButtonIcon,
    Text: ButtonText,
    KeyboardShortcut: ButtonKeyboardShortcut,
});

export default CardSectionButton;
