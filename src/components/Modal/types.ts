import type {FocusTrapProps} from 'focus-trap-react';
import type {GestureResponderEvent, PanResponderGestureState, ViewStyle} from 'react-native';
import type {Direction, ModalProps as ReactNativeModalProps} from 'react-native-modal';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type BottomDockedModalProps from './BottomDockedModal/types';

type FocusTrapOptions = Exclude<FocusTrapProps['focusTrapOptions'], undefined>;

type PopoverAnchorPosition = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};

type WindowState = {
    shouldGoBack: boolean;
};

type BaseModalProps = Partial<ReactNativeModalProps> &
    Partial<BottomDockedModalProps> & {
        /** Decides whether the modal should cover fullscreen. FullScreen modal has backdrop */
        fullscreen?: boolean;

        /** Should we close modal on outside click */
        shouldCloseOnOutsideClick?: boolean;

        /** Should we announce the Modal visibility changes? */
        shouldSetModalVisibility?: boolean;

        /** Callback method fired when the user requests to close the modal */
        onClose: () => void;

        /** Function to call when the user presses on the modal backdrop */
        onBackdropPress?: () => void;

        /** State that determines whether to display the modal or not */
        isVisible: boolean;

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

        /** Whether the modal should go under the system navigation bar */
        navigationBarTranslucent?: boolean;

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

        /** Whether handle navigation back when modal show. */
        shouldHandleNavigationBack?: boolean;

        /** Should we use a custom backdrop for the modal? (This prevents focus issues on desktop) */
        shouldUseCustomBackdrop?: boolean;

        /** unique id for the modal */
        modalId?: number;

        /**
         * Whether the modal should enable the new focus manager.
         * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
         * */
        shouldEnableNewFocusManagement?: boolean;

        /** How to re-focus after the modal is dismissed */
        restoreFocusType?: ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE>;

        /** Should we apply padding style in modal itself. If this value is false, we will handle it in ScreenWrapper */
        shouldUseModalPaddingStyle?: boolean;

        /** Whether swipe gestures should propagate to parent components */
        propagateSwipe?: boolean | ((event?: GestureResponderEvent, gestureState?: PanResponderGestureState) => boolean);

        /** After swipe more than threshold modal will close */
        swipeThreshold?: number;

        /** In which direction modal will swipe */
        swipeDirection?: Direction;

        /** Whether modals with type CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED should use new modal component */
        shouldUseNewModal?: boolean;

        /** Used to set the element that should receive the initial focus */
        initialFocus?: FocusTrapOptions['initialFocus'];

        /** Whether to prevent the focus trap from scrolling the element into view. */
        shouldPreventScrollOnFocus?: boolean;

        /**
         * Temporary flag to disable safe area bottom spacing in modals and to allow edge-to-edge content.
         * Modals should not always apply bottom safe area padding, instead it should be applied to the scrollable/bottom-docked content directly.
         * This flag can be removed, once all components/screens have switched to edge-to-edge safe area handling.
         */
        enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

        /**
         * Whether the modal should apply the Side Panel offset.
         * This is used to adjust the modal position when the Side Panel is open.
         */
        shouldApplySidePanelOffset?: boolean;
    };

export default BaseModalProps;
export type {PopoverAnchorPosition, WindowState};
