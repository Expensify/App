import type {ComponentRef, ForwardedRef} from 'react';
import type {ViewProps, View} from 'react-native';

type FocusTrapContainerElementProps = ViewProps & {
    /** Callback to register focus trap container element */
    onContainerElementChanged?: (element: HTMLElement | null) => void;

    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

export default FocusTrapContainerElementProps;
