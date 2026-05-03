import React, {useRef} from 'react';
import type {ReactNode} from 'react';
import type {PressableProps as RNPressableProps, StyleProp, View, ViewStyle} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {AnchorRef} from './RootContext';
import {useRootActions} from './RootContext';

type TriggerProps = WithSentryLabel & {
    /** Visual content of the button (e.g. an `<Icon>`). The trigger itself is the pressable —
     *  children must NOT be another pressable. */
    children: ReactNode;
    /** Style applied to the underlying pressable. */
    style?: StyleProp<ViewStyle>;
    /** Style applied while the pressable is hovered (web only). */
    hoverStyle?: StyleProp<ViewStyle>;
    /** Accessible name announced by screen readers. Required because the trigger
     *  contains arbitrary visual content that may not be self-describing. */
    accessibilityLabel: string;
    /** ARIA role forwarded to the pressable. */
    role?: RNPressableProps['role'];
    /** When true, presses are ignored and the popover will not open. */
    disabled?: boolean;
    /** Test ID forwarded to the pressable for use in tests. */
    testID?: string;
};

/**
 * Pressable that opens its enclosing `<Root>` and registers itself as the active anchor.
 * Measures its own layout via `getBoundingClientRect` on press — no layout effect, no parent
 * coordination — so multiple Triggers can share a single Root and the popover lands next to
 * whichever was pressed last. `getBoundingClientRect` is supported on RN's New Architecture
 * (`ReadOnlyElement`) as well as the DOM, so the same code path works on web and native.
 */
function Trigger({children, style, hoverStyle, accessibilityLabel, role, disabled, sentryLabel, testID}: TriggerProps): React.ReactElement {
    const {setIsVisible, setActiveAnchor} = useRootActions(Trigger.displayName);
    const ownRef = useRef<View>(null);

    const handlePress = () => {
        const node = ownRef.current;
        if (!node || typeof node.getBoundingClientRect !== 'function') {
            // Test renderer / unsupported runtime — open without a fresh measurement.
            setIsVisible(true);
            return;
        }
        const {x, y, width, height} = node.getBoundingClientRect();
        setActiveAnchor({ref: ownRef as AnchorRef, rect: {x, y, width, height}});
        setIsVisible(true);
    };

    return (
        <PressableWithFeedback
            ref={ownRef}
            onPress={handlePress}
            disabled={disabled}
            style={style}
            hoverStyle={hoverStyle}
            accessibilityLabel={accessibilityLabel}
            role={role}
            sentryLabel={sentryLabel}
            testID={testID}
        >
            {children}
        </PressableWithFeedback>
    );
}

Trigger.displayName = 'PopoverMenu.Trigger';

export default Trigger;
export type {TriggerProps};
