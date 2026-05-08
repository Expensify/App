import React from 'react';
import type {ReactNode} from 'react';
import type {Role, StyleProp, ViewStyle} from 'react-native';
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
};

/** For non-`PressableWithFeedback` shapes (e.g. `IconButton`), call `usePopoverTrigger()` directly. */
function Trigger({children, accessibilityLabel, sentryLabel, style, disabled, role, testID}: TriggerProps): React.ReactElement {
    const {ref, onPress} = usePopoverTrigger();
    return (
        <PressableWithFeedback
            ref={ref}
            onPress={onPress}
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
