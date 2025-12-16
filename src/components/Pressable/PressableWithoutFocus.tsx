import React, {useRef} from 'react';
import type {View} from 'react-native';
import GenericPressable from './GenericPressable';
import type PressableProps from './GenericPressable/types';

/**
 * This component prevents the tapped element from capturing focus.
 * We need to blur this element when clicked as it opens modal that implements focus-trapping.
 * When the modal is closed it focuses back to the last active element.
 * Therefore it shifts the element to bring it back to focus.
 * https://github.com/Expensify/App/issues/6806
 */
function PressableWithoutFocus({children, onPress, onLongPress, ...rest}: PressableProps) {
    const ref = useRef<View>(null);

    const pressAndBlur = () => {
        ref?.current?.blur();
        onPress?.();
    };

    return (
        <GenericPressable
            onPress={pressAndBlur}
            onLongPress={onLongPress}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </GenericPressable>
    );
}

export default PressableWithoutFocus;
