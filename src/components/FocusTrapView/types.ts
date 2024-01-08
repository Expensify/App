import type {ViewProps} from 'react-native';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type FocusTrapViewProps = ChildrenProps & {
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

    /**
     * Whether the FocusTrap should return focus to the last focused element when it is deactivated.
     * The default value is True, but sometimes we have to disable it, as it causes unexpected behavior.
     */
    shouldReturnFocusOnDeactivate?: boolean;
} & ViewProps;

export default FocusTrapViewProps;
