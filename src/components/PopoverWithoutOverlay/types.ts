import type BaseModalProps from '@components/Modal/types';
import type {AnchorType} from '@components/PopoverProvider/types';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

type PopoverWithoutOverlayProps = ChildrenProps &
    Omit<BaseModalProps, 'type' | 'popoverAnchorPosition'> & {
        anchorPosition?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };

        anchorRef: RefObject<AnchorType>;

        /** Time in milliseconds for the modal entering animation */
        animationInTiming?: number;

        disableAnimation?: boolean;
        withoutOverlayRef: RefObject<ComponentRef<typeof View> | HTMLDivElement | null>;

        /** Whether we should display the popover below other modals (e.g. SidePanel, RHP) */
        shouldDisplayBelowModals?: boolean;
    };

export default PopoverWithoutOverlayProps;
