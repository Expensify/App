import React, {forwardRef, useEffect} from 'react';
import GenericPressable from './implementation';
import type {PressableRef} from './types';
import type PressableProps from './types';

const pressableRegistry = new Map<string, PressableProps>();

function getPressableProps(nativeID: string): PressableProps | undefined {
    return pressableRegistry.get(nativeID);
}

function E2EGenericPressableWrapper(props: PressableProps, ref: PressableRef) {
    useEffect(() => {
        const nativeId = props.nativeID;
        if (!nativeId) {
            return;
        }
        console.debug(`[E2E] E2EGenericPressableWrapper: Registering pressable with nativeID: ${nativeId}`);
        pressableRegistry.set(nativeId, props);
    }, [props]);

    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

E2EGenericPressableWrapper.displayName = 'E2EGenericPressableWrapper';

export default forwardRef(E2EGenericPressableWrapper);
export {getPressableProps};
