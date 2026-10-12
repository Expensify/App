import type BaseModalProps from '@components/Modal/types';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ComponentRef, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';

type PopoverWithoutOverlayProps = ChildrenProps &
    Omit<BaseModalProps, 'type' | 'popoverAnchorPosition'> & {
        anchorPosition?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };

        anchorRef: RefObject<ComponentRef<typeof View> | HTMLDivElement | ComponentRef<typeof Text> | null>;

        /** Time in milliseconds for the modal entering animation */
        animationInTiming?: number;

        disableAnimation?: boolean;
        withoutOverlayRef: RefObject<ComponentRef<typeof View> | HTMLDivElement | null>;

        /** Whether we should display the popover below other modals (e.g. SidePanel, RHP) */
        shouldDisplayBelowModals?: boolean;
    };

export default PopoverWithoutOverlayProps;
