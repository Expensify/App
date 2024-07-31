import type {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils';

type FocusTrapContainerElementProps = ViewProps & {
    onContainerElementChanged?: (element: HTMLElement | null) => void;
};

export default FocusTrapContainerElementProps;
