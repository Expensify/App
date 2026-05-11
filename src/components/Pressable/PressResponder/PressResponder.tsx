import React, {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import Log from '@libs/Log';
import PressResponderContext from './PressResponderContext';
import type {PressResponderContextValue} from './PressResponderContext';

type PressResponderProps = Omit<PressResponderContextValue, 'register'> & {
    children: ReactNode;
};

function PressResponder({children, ...responderProps}: PressResponderProps): React.ReactElement {
    const isRegisteredRef = useRef(false);
    const value: PressResponderContextValue = {
        ...responderProps,
        register: () => {
            isRegisteredRef.current = true;
        },
    };

    useEffect(() => {
        if (isRegisteredRef.current || !__DEV__) {
            return;
        }
        Log.warn('[PressResponder] rendered without a pressable descendant — make sure a PressableWithFeedback (or similar) is in the subtree.');
    }, []);

    return <PressResponderContext.Provider value={value}>{children}</PressResponderContext.Provider>;
}

export default PressResponder;
export type {PressResponderProps};
