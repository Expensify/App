import type {ActionSheetAwareScrollViewProps} from '@components/ActionSheetAwareScrollView/types';

import type {KeyboardChatScrollViewProps} from 'react-native-keyboard-controller';

type AnimatedActionSheetAwareScrollViewProps = ActionSheetAwareScrollViewProps & Pick<KeyboardChatScrollViewProps, 'inverted'>;

export default AnimatedActionSheetAwareScrollViewProps;
