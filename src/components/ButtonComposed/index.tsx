/**
 * ButtonComposed – a new Button built with composition API.
 *
 * Instead of a large flat props list (icon, text, shouldShowRightIcon, …),
 * sub-components are composed as children:
 *
 * @example
 * ```tsx
 * import ButtonComposed from '@components/ButtonComposed';
 * import * as icons from '@expensify/react-native-expensify-icons';
 *
 * <ButtonComposed onPress={handlePress} success>
 *   <ButtonComposed.IconLeft src={icons.UserPlus} />
 *   <ButtonComposed.Text>Add members</ButtonComposed.Text>
 *   <ButtonComposed.IconRight src={icons.ArrowRight} />
 * </ButtonComposed>
 * ```
 *
 * The old `Button` component is not affected – migration can be gradual.
 */
import withNavigationFallback from '@components/withNavigationFallback';
import ButtonComposedComponent from './ButtonComposed';
import ButtonComposedIconLeft from './ButtonComposedIconLeft';
import ButtonComposedIconRight from './ButtonComposedIconRight';
import ButtonComposedText from './ButtonComposedText';

const ButtonComposed = Object.assign(withNavigationFallback(ButtonComposedComponent), {
    IconLeft: ButtonComposedIconLeft,
    Text: ButtonComposedText,
    IconRight: ButtonComposedIconRight,
});

export default ButtonComposed;
export type {ButtonComposedProps} from './ButtonComposed';
