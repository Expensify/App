import React, {useEffect} from 'react';
import {DeviceEventEmitter} from 'react-native';
import BaseTextInput from './implementation';
import type {BaseTextInputProps} from './types';

function BaseTextInputE2E({ref, ...props}: BaseTextInputProps) {
    useEffect(() => {
        const testId = props.testID;
        if (!testId) {
            return;
        }
        console.debug(`[E2E] BaseTextInput: text-input with testID: ${testId} changed text to ${props.value}`);

        DeviceEventEmitter.emit('onChangeText', {testID: testId, value: props.value});
    }, [props.value, props.testID]);

    return (
        <BaseTextInput
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default BaseTextInputE2E;
