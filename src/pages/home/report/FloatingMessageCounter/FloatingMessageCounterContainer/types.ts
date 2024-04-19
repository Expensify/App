import type {StyleProp, ViewStyle} from 'react-native';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type FloatingMessageCounterContainerProps = ChildrenProps & {
    /** Styles to be assigned to Container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Specifies the accessibility hint for the component */
    accessibilityHint?: string;
};

export default FloatingMessageCounterContainerProps;
