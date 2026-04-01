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
 *   <Button.IconLeft src={icons.UserPlus} />
 *   <Button.Text>Add members</Button.Text>
 *   <Button.IconRight src={icons.ArrowRight} />
 * </Button>
 * ```
 *
 * The old `Button` component is not affected – migration can be gradual.
 */
import withNavigationFallback from '@components/withNavigationFallback';
import ButtonComponent from './Button';
import ButtonDoubleLineText from './primitives/ButtonDoubleLineText';
import {ButtonIconLeft, ButtonIconRight} from './primitives/ButtonIcons';
import ButtonText from './primitives/ButtonText';

const Button = Object.assign(withNavigationFallback(ButtonComponent), {
    IconLeft: ButtonIconLeft,
    Text: ButtonText,
    IconRight: ButtonIconRight,
    DoubleLineText: ButtonDoubleLineText,
});

export default Button;
export type {ButtonProps} from './Button';
