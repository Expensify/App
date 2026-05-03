import React, {useRef} from 'react';
import type {ReactNode} from 'react';
import type {PressableProps as RNPressableProps, StyleProp, View, ViewStyle} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Log from '@libs/Log';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type {AnchorRef} from './RootContext';
import {useRootActions} from './RootContext';

type TriggerProps = WithSentryLabel & {
    /** Children must NOT themselves be a pressable — Trigger IS the pressable. */
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    /** Web only. */
    hoverStyle?: StyleProp<ViewStyle>;
    accessibilityLabel: string;
    role?: RNPressableProps['role'];
    disabled?: boolean;
    testID?: string;
};

/** Pressable that opens its enclosing `<Root>` and registers itself as the popover's anchor. */
function Trigger({children, style, hoverStyle, accessibilityLabel, role, disabled, sentryLabel, testID}: TriggerProps): React.ReactElement {
    const {setIsVisible, setActiveAnchor} = useRootActions(Trigger.displayName);
    const ownRef: AnchorRef = useRef<View | null>(null);

    const handlePress = () => {
        const node = ownRef.current;
        if (!node) {
            return;
        }
        // Fabric: sync `getBoundingClientRect` (popover lands in the same frame). Old Arch / Paper / test renderer: async `measureInWindow`.
        if (typeof node.getBoundingClientRect === 'function') {
            const {x, y, width, height} = node.getBoundingClientRect();
            setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
            setIsVisible(true);
            return;
        }
        if (typeof node.measureInWindow === 'function') {
            node.measureInWindow((x, y, width, height) => {
                setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
                setIsVisible(true);
            });
            return;
        }
        // Unreachable in real runtimes (Fabric, Paper, web all expose at least one).
        Log.warn('[PopoverMenu.Trigger] anchor node exposes neither getBoundingClientRect nor measureInWindow');
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
