import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';
import type BaseModalProps from '@components/Modal/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

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
        anchorRef: RefObject<View | HTMLDivElement | Text | null>;

        /** Time in milliseconds for the modal entering animation */
        animationInTiming?: number;

        /** Whether disable the animations */
        disableAnimation?: boolean;

        /** The ref of the popover */
        withoutOverlayRef: RefObject<View | HTMLDivElement | null>;

        /** Whether we should display the popover below other modals (e.g. SidePanel, RHP) */
        shouldDisplayBelowModals?: boolean;
    };

export default PopoverWithoutOverlayProps;
