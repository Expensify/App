import {GestureResponderEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type PressableWithSecondaryInteractionProps = PressableWithFeedbackProps &
    ChildrenProps & {
        /** The function that should be called when this pressable is pressed */
        onPress: (event?: GestureResponderEvent) => void;

        /** The function that should be called when this pressable is pressedIn */
        onPressIn?: (event?: GestureResponderEvent) => void;

        /** The function that should be called when this pressable is pressedOut */
        onPressOut?: (event?: GestureResponderEvent) => void;

        /**
         * The function that should be called when this pressable is LongPressed or right-clicked.
         *
         * This function should be stable, preferably wrapped in a `useCallback` so that it does not
         * cause several re-renders.
         */
        onSecondaryInteraction?: (event: GestureResponderEvent | MouseEvent) => void;

        /** Prevent the default ContextMenu on web/Desktop */
        preventDefaultContextMenu?: boolean;

        /** Use Text instead of Pressable to create inline layout.
         * It has few limitations in comparison to Pressable.
         *
         * - No support for delayLongPress.
         * - No support for pressIn and pressOut events.
         * - No support for opacity
         *
         * Note: Web uses styling instead of Text due to no support of LongPress. Thus above pointers are not valid for web.
         */
        inline?: boolean;

        /** Disable focus trap for the element on secondary interaction  */
        withoutFocusOnSecondaryInteraction?: boolean;

        /** Opacity to reduce to when active  */
        activeOpacity?: number;

        /** Used to apply styles to the Pressable */
        style?: StyleProp<ViewStyle & TextStyle>;

        /** Whether the long press with hover behavior is enabled */
        enableLongPressWithHover?: boolean;
    };

export default PressableWithSecondaryInteractionProps;
