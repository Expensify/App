import {ValueOf} from 'type-fest';
import {ViewStyle} from 'react-native';
import {ModalProps} from 'react-native-modal';
import ChildrenProps from '../../types/utils/ChildrenProps';
import {WindowDimensionsProps} from '../withWindowDimensions/types';
import CONST from '../../CONST';

type BaseModalProps = WindowDimensionsProps &
    ChildrenProps & {
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

        propagateSwipe?: Pick<ModalProps, 'propagateSwipe'>;

        /** Style of modal to display */
        // type: PropTypes.oneOf(_.values(CONST.MODAL.MODAL_TYPE)),
        type?: ValueOf<typeof CONST.MODAL.MODAL_TYPE>;

        /** A react-native-animatable animation definition for the modal display animation. */
        animationIn?: Pick<ModalProps, 'animationIn'>;

        /** A react-native-animatable animation definition for the modal hide animation. */
        animationOut?: Pick<ModalProps, 'animationOut'>;

        useNativeDriver?: Pick<ModalProps, 'useNativeDriver'>;

        animationInTiming?: Pick<ModalProps, 'animationInTiming'>;

        animationOutTiming?: Pick<ModalProps, 'animationOutTiming'>;

        /** The anchor position of a popover modal. Has no effect on other modal types. */
        popoverAnchorPosition?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };

        /** Modal container styles  */
        innerContainerStyle?: Pick<ModalProps, 'style'>;

        outerStyle?: ViewStyle;

        /** Whether the modal should go under the system statusbar */
        statusBarTranslucent?: boolean;

        onLayout: Pick<ModalProps, 'onLayout'>;

        /** Whether the modal should avoid the keyboard */
        avoidKeyboard?: boolean;

        /**
         * Whether the modal should hide its content while animating. On iOS, set to true
         * if `useNativeDriver` is also true, to avoid flashes in the UI.
         *
         * See: https://github.com/react-native-modal/react-native-modal/pull/116
         * */
        hideModalContentWhileAnimating?: boolean;
    };

export default BaseModalProps;
