import type {ViewProps} from 'react-native';

type FocusTrapContainerElementProps = ViewProps & {
    /** Callback to register focus trap container element */
    onContainerElementChanged?: (element: HTMLElement | null) => void;
};

export default FocusTrapContainerElementProps;
