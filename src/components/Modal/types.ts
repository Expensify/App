import type {ViewStyle} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type PopoverAnchorPosition = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};

type BaseModalProps = Partial<ModalProps> & {
    /** Decides whether the modal should cover fullscreen. FullScreen modal has backdrop */
    fullscreen?: boolean;

    /** Should we close modal on outside click */
    shouldCloseOnOutsideClick?: boolean;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;

    /** Callback method fired when the user requests to close the modal */
    onClose: () => void;

    /** State that determines whether to display the modal or not */
    isVisible: boolean;

    /** Callback method fired when the user requests to submit the modal content. */
    onSubmit?: () => void;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;

    /** Callback method fired when the modal is shown */
    onModalShow?: () => void;

    /** Style of modal to display */
    type?: ValueOf<typeof CONST.MODAL.MODAL_TYPE>;

    /** The anchor position of a popover modal. Has no effect on other modal types. */
    popoverAnchorPosition?: PopoverAnchorPosition;

    outerStyle?: ViewStyle;

    /** Whether the modal should go under the system statusbar */
    statusBarTranslucent?: boolean;

    /** Whether the modal should avoid the keyboard */
    avoidKeyboard?: boolean;

    /** Modal container styles  */
    innerContainerStyle?: ViewStyle;

    /**
     * Whether the modal should hide its content while animating. On iOS, set to true
     * if `useNativeDriver` is also true, to avoid flashes in the UI.
     *
     * See: https://github.com/react-native-modal/react-native-modal/pull/116
     * */
    hideModalContentWhileAnimating?: boolean;

    /** Should we use a custom backdrop for the modal? (This prevents focus issues on desktop) */
    shouldUseCustomBackdrop?: boolean;

    /** Whether the modal should clear the focus record for the current business type. */
    shouldClearFocusWithType?: boolean;

    /** How to re-focus after the modal is dismissed */
    restoreFocusType?: ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE>;
};

export default BaseModalProps;
export type {PopoverAnchorPosition};
