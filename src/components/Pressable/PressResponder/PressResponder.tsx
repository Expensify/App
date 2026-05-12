import React, {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import Log from '@libs/Log';
import PressResponderContext from './PressResponderContext';
import type {PressResponderContextValue, RegisterKind} from './PressResponderContext';

type PressResponderProps = Omit<PressResponderContextValue, 'register' | 'registerRef'> & {
    children: ReactNode;
};

function PressResponder({
    children,
    ref,
    onPress,
    onSecondaryInteraction,
    accessibilityState,
    accessibilityHasPopup,
    nativeID,
    accessibilityControls,
}: PressResponderProps): React.ReactElement {
    const consumedKindsRef = useRef<Set<RegisterKind>>(new Set());
    const refAttachedRef = useRef(false);

    const value: PressResponderContextValue = {
        ref,
        onPress,
        onSecondaryInteraction,
        accessibilityState,
        accessibilityHasPopup,
        nativeID,
        accessibilityControls,
        register: (kind: RegisterKind) => {
            consumedKindsRef.current.add(kind);
        },
        registerRef: () => {
            refAttachedRef.current = true;
        },
    };

    // Stable boolean deps so identity churn from fresh handler closures doesn't re-run the dev-warn each render.
    const hasOnPress = !!onPress;
    const hasOnSecondary = !!onSecondaryInteraction;
    const hasRef = !!ref;
    useEffect(() => {
        if (!__DEV__) {
            return;
        }
        const required: RegisterKind[] = [];
        if (hasOnPress) {
            required.push('press');
        }
        if (hasOnSecondary) {
            required.push('secondary');
        }
        const missing = required.filter((kind) => !consumedKindsRef.current.has(kind));
        if (missing.length > 0) {
            Log.warn(
                `[PressResponder] published ${missing.join(', ')} handler(s) but no descendant pressable consumed them. Use <PressableWithFeedback> for 'press' and <PressableWithSecondaryInteraction> for 'secondary'.`,
            );
            return;
        }
        if (hasRef && !refAttachedRef.current) {
            Log.warn(
                '[PressResponder] published a ref but no descendant called `useResponderRef`. The anchor will not be measurable on press; use <PressableWithFeedback> or call useResponderRef in your custom pressable.',
            );
        }
    }, [hasOnPress, hasOnSecondary, hasRef]);

    return <PressResponderContext.Provider value={value}>{children}</PressResponderContext.Provider>;
}

export default PressResponder;
export type {PressResponderProps};
