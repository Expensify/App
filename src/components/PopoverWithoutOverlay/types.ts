import {View} from 'react-native';
import BaseModalProps from '@components/Modal/types';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type PopoverWithoutOverlayProps = ChildrenProps &
    Omit<BaseModalProps, 'type' | 'popoverAnchorPosition'> & {
        /** The anchor position of the popover */
        anchorPosition?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };

        /** The anchor ref of the popover */
        anchorRef: React.RefObject<HTMLElement>;

        /** A react-native-animatable animation timing for the modal display animation */
        animationInTiming?: number;

        /** Whether disable the animations */
        disableAnimation?: boolean;

        /** The ref of the popover */
        withoutOverlayRef: React.RefObject<HTMLElement & View>;
    };

export default PopoverWithoutOverlayProps;
