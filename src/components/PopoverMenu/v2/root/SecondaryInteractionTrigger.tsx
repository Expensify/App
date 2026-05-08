import React from 'react';
import type {ReactNode} from 'react';
import type {Role, StyleProp, ViewStyle} from 'react-native';
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
};

/** Long-press / right-click variant of `<Trigger>`. For non-`PressableWithSecondaryInteraction` shapes, call `useSecondaryInteractionTrigger()` directly. */
function SecondaryInteractionTrigger({children, accessibilityLabel, sentryLabel, style, disabled, role, testID}: SecondaryInteractionTriggerProps): React.ReactElement {
    const {ref, onSecondaryInteraction} = useSecondaryInteractionTrigger();
    return (
        <PressableWithSecondaryInteraction
            ref={ref}
            onSecondaryInteraction={onSecondaryInteraction}
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
