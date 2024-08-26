/**
 * A wrapper View component allowing us to register a container element for a FocusTrap
 */
import type {ForwardedRef} from 'react';
import React from 'react';
import {View} from 'react-native';
import type FocusTrapContainerElementProps from './FocusTrapContainerElementProps';

function FocusTrapContainerElement({onContainerElementChanged, ...props}: FocusTrapContainerElementProps, ref?: ForwardedRef<View>) {
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

FocusTrapContainerElement.displayName = 'FocusTrapContainerElement';

export default React.forwardRef(FocusTrapContainerElement);
