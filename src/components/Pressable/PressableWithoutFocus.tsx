import castToSentryLabel from '@libs/castToSentryLabel';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';

import type PressableProps from './GenericPressable/types';

import GenericPressable from './GenericPressable';

/**
 * This component prevents the tapped element from capturing focus.
 * We need to blur this element when clicked as it opens modal that implements focus-trapping.
 * When the modal is closed it focuses back to the last active element.
 * Therefore it shifts the element to bring it back to focus.
 * https://github.com/Expensify/App/issues/6806
 */
function PressableWithoutFocus({children, ...rest}: PressableProps) {
    const ref = useRef<ComponentRef<typeof View>>(null);

    const pressAndBlur = () => {
        ref?.current?.blur();
        rest.onPress?.();
    };

    return (
        <GenericPressable
            ref={ref}
            {...rest}
            sentryLabel={castToSentryLabel(rest.sentryLabel)}
            onPress={pressAndBlur}
        >
            {children}
        </GenericPressable>
    );
}

export default PressableWithoutFocus;
