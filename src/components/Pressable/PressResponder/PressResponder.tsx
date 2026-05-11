import React, {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import Log from '@libs/Log';
import PressResponderContext from './PressResponderContext';
import type {PressResponderContextValue, RegisterKind} from './PressResponderContext';

type PressResponderProps = Omit<PressResponderContextValue, 'register'> & {
    children: ReactNode;
};

function PressResponder({children, ref, onPress, onSecondaryInteraction, accessibilityState, nativeID, accessibilityControls}: PressResponderProps): React.ReactElement {
    const consumedKindsRef = useRef<Set<RegisterKind>>(new Set());

    const value: PressResponderContextValue = {
        ref,
        onPress,
        onSecondaryInteraction,
        accessibilityState,
        nativeID,
        accessibilityControls,
        register: (kind: RegisterKind) => {
            consumedKindsRef.current.add(kind);
        },
    };

    useEffect(() => {
        if (!__DEV__) {
            return;
        }
        const required: RegisterKind[] = [];
        if (onPress) {
            required.push('press');
        }
        if (onSecondaryInteraction) {
            required.push('secondary');
        }
        const missing = required.filter((kind) => !consumedKindsRef.current.has(kind));
        if (missing.length === 0) {
            return;
        }
        Log.warn(
            `[PressResponder] published ${missing.join(', ')} handler(s) but no descendant pressable consumed them. Use <PressableWithFeedback> for 'press' and <PressableWithSecondaryInteraction> for 'secondary'.`,
        );
    }, [onPress, onSecondaryInteraction]);

    return <PressResponderContext.Provider value={value}>{children}</PressResponderContext.Provider>;
}

export default PressResponder;
export type {PressResponderProps};
