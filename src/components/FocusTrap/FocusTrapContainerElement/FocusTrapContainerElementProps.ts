import type {ForwardedRef} from 'react';
import type {View, ViewProps} from 'react-native';

type FocusTrapContainerElementProps = ViewProps & {
    /** Callback to register focus trap container element */
    onContainerElementChanged?: (element: HTMLElement | null) => void;

    ref?: ForwardedRef<View>;
};

export default FocusTrapContainerElementProps;
