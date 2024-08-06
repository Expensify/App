import type {ViewProps} from 'react-native';

type FocusTrapContainerElementProps = ViewProps & {
    onContainerElementChanged?: (element: HTMLElement | null) => void;
};

export default FocusTrapContainerElementProps;
