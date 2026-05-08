import React from 'react';
import type {ReactNode} from 'react';
import type {GestureResponderEvent, Role, StyleProp, ViewStyle} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import usePopoverTrigger from './usePopoverTrigger';

type TriggerProps = WithSentryLabel & {
    children: ReactNode;
    accessibilityLabel: string;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    role?: Role;
    testID?: string;
    /** Runs before the popover opens; cannot gate opening (drop to the hook for that). */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

/** For non-`PressableWithFeedback` shapes (e.g. `IconButton`), call `usePopoverTrigger()` directly. */
function Trigger({children, accessibilityLabel, sentryLabel, style, disabled, role, testID, onPress: consumerOnPress}: TriggerProps): React.ReactElement {
    const {ref, onPress: triggerOnPress} = usePopoverTrigger();
    const handlePress = (event?: GestureResponderEvent | KeyboardEvent) => {
        consumerOnPress?.(event);
        triggerOnPress();
    };
    return (
        <PressableWithFeedback
            ref={ref}
            onPress={handlePress}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={sentryLabel}
            style={style}
            disabled={disabled}
            role={role}
            testID={testID}
        >
            {children}
        </PressableWithFeedback>
    );
}

Trigger.displayName = 'PopoverMenu.Trigger';

export default Trigger;
export type {TriggerProps};
