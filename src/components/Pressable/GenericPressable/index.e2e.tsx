import React, {forwardRef, useEffect} from 'react';
import {DeviceEventEmitter} from 'react-native';
import GenericPressable from './implementation';
import type {PressableRef} from './types';
import type PressableProps from './types';

const pressableRegistry = new Map<string, PressableProps>();

function getPressableProps(testId: string): PressableProps | undefined {
    return pressableRegistry.get(testId);
}

function E2EGenericPressableWrapper(props: PressableProps, ref: PressableRef) {
    useEffect(() => {
        const testId = props.testID;
        if (!testId) {
            return;
        }
        console.debug(`[E2E] E2EGenericPressableWrapper: Registering pressable with testID: ${testId}`);
        pressableRegistry.set(testId, props);

        DeviceEventEmitter.emit('onBecameVisible', testId);
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
