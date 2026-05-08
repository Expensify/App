import React from 'react';
import type {ReactNode} from 'react';
import type {GestureResponderEvent, Role, StyleProp, ViewStyle} from 'react-native';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import useSecondaryInteractionTrigger from './useSecondaryInteractionTrigger';

type SecondaryInteractionTriggerProps = WithSentryLabel & {
    children: ReactNode;
    accessibilityLabel: string;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    role?: Role;
    testID?: string;
    /** Runs before the popover opens. For analytics or pre-press setup; cannot gate opening — drop to `useSecondaryInteractionTrigger()` if you need conditional opening. */
    onSecondaryInteraction?: (event: GestureResponderEvent | MouseEvent) => void;
};

/** Long-press / right-click variant of `<Trigger>`. For non-`PressableWithSecondaryInteraction` shapes, call `useSecondaryInteractionTrigger()` directly. */
function SecondaryInteractionTrigger({
    children,
    accessibilityLabel,
    sentryLabel,
    style,
    disabled,
    role,
    testID,
    onSecondaryInteraction: consumerOnSecondaryInteraction,
}: SecondaryInteractionTriggerProps): React.ReactElement {
    const {ref, onSecondaryInteraction: triggerOnSecondaryInteraction} = useSecondaryInteractionTrigger();
    const handleSecondaryInteraction = (event: GestureResponderEvent | MouseEvent) => {
        consumerOnSecondaryInteraction?.(event);
        triggerOnSecondaryInteraction();
    };

    return (
        <PressableWithSecondaryInteraction
            ref={ref}
            onSecondaryInteraction={handleSecondaryInteraction}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={sentryLabel}
            style={style}
            disabled={disabled}
            role={role}
            testID={testID}
        >
            {children}
        </PressableWithSecondaryInteraction>
    );
}

SecondaryInteractionTrigger.displayName = 'PopoverMenu.SecondaryInteractionTrigger';

export default SecondaryInteractionTrigger;
export type {SecondaryInteractionTriggerProps};
