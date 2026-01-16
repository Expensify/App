/**
 * A wrapper View component allowing us to register a container element for a FocusTrap
 */
import React from 'react';
import {View} from 'react-native';
import type FocusTrapContainerElementProps from './FocusTrapContainerElementProps';

function FocusTrapContainerElement({onContainerElementChanged, ref, ...props}: FocusTrapContainerElementProps) {
    return (
        <View
            ref={(node) => {
                const r = ref;
                if (typeof r === 'function') {
                    r(node);
                } else if (r) {
                    r.current = node;
                }
                onContainerElementChanged?.(node as unknown as HTMLElement | null);
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default FocusTrapContainerElement;
