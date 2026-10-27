import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';
import ButtonIcon from '@components/Button/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/Button/primitives/ButtonKeyboardShortcut';
import ButtonText from '@components/Button/primitives/ButtonText';

function CardSectionButtonBase(props: ButtonProps) {
    return <Button {...props} />;
}

const CardSectionButton = Object.assign(CardSectionButtonBase, {
    Icon: ButtonIcon,
    Text: ButtonText,
    KeyboardShortcut: ButtonKeyboardShortcut,
});

export default CardSectionButton;
