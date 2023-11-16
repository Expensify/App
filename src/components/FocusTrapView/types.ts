import {ReactNode} from 'react';
import {ViewProps} from 'react-native';

type FocusTrapViewProps = {
    /** Children to wrap with FocusTrap */
    children: ReactNode;

    /**
     *  Whether to enable the FocusTrap.
     *  If the FocusTrap is disabled, we just pass the children through.
     */
    isEnabled?: boolean;

    /**
     *  Whether to disable auto focus
     *  It is used when the component inside the FocusTrap have their own auto focus logic
     */
    shouldEnableAutoFocus?: boolean;

    /** Whether the FocusTrap is active (listening for events) */
    isActive?: boolean;
} & ViewProps;

export default FocusTrapViewProps;
