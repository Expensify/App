import React, {useRef} from 'react';
import type {ReactNode} from 'react';
import type {PressableProps as RNPressableProps, StyleProp, View, ViewStyle} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
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

function Trigger({children, style, hoverStyle, accessibilityLabel, role, disabled, sentryLabel, testID}: TriggerProps): React.ReactElement {
    const {setIsVisible, setActiveAnchor} = useRootActions(Trigger.displayName);
    const ownRef = useRef<View>(null);

    const handlePress = () => {
        const node = ownRef.current;
        if (!node || typeof node.getBoundingClientRect !== 'function') {
            // Test renderer / unsupported runtime — open without a measurement.
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
