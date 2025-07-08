import type {ButtonProps} from '@components/Button';
import type PressableProps from '@components/Pressable/GenericPressable/types';

type PressHandlerProps = Pick<PressableProps & ButtonProps, 'onPressIn' | 'onPress'>;

export default PressHandlerProps;
