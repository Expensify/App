/**
 * Button – a new Button built with composition API.
 *
 * Instead of a large flat props list (icon, text, shouldShowRightIcon, …),
 * sub-components are composed as children:
 *
 * @example
 * ```tsx
 * import Button from '@components/Button';
 * import * as icons from '@expensify/react-native-expensify-icons';
 *
 * <Button onPress={handlePress} success>
 *   <Button.Icon src={icons.UserPlus} />
 *   <Button.Text>Add members</Button.Text>
 *   <Button.Icon src={icons.ArrowRight} />
 * </Button>
 * ```
 *
 * The old `Button` component is not affected – migration can be gradual.
 */
import React from 'react';

import ButtonComponent from './Button';
import ButtonIcon from './primitives/ButtonIcon';
import ButtonKeyboardShortcut from './primitives/ButtonKeyboardShortcut';
import ButtonText from './primitives/ButtonText';

function ButtonBase(props: React.ComponentProps<typeof ButtonComponent>) {
    return <ButtonComponent {...props} />;
}

const Button = Object.assign(ButtonBase, {
    Icon: ButtonIcon,
    Text: ButtonText,
    KeyboardShortcut: ButtonKeyboardShortcut,
});

export default Button;
