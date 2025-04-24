import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';
import type {PopoverAnchorPosition} from '@components/Modal/types';
import type BaseModalProps from '@components/Modal/types';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type PopoverDimensions = {
    width: number;
    height: number;
};

type PopoverProps = BaseModalProps &
    ChildrenProps & {
        /** The anchor position of the popover */
        anchorPosition?: PopoverAnchorPosition;

        /** The anchor alignment of the popover */
        anchorAlignment?: AnchorAlignment;

        /** The anchor ref of the popover */
        anchorRef: RefObject<View | HTMLDivElement | Text>;

        /** Whether disable the animations */
        disableAnimation?: boolean;

        /** Whether we don't want to show overlay */
        withoutOverlay?: boolean;

        /** The dimensions of the popover */
        popoverDimensions?: PopoverDimensions;

        /** The ref of the popover */
        withoutOverlayRef?: RefObject<View | HTMLDivElement>;

        /** Whether we want to show the popover on the right side of the screen */
        fromSidebarMediumScreen?: boolean;

        /** Whether we should close when browser navigation change. This doesn't affect native platform */
        shouldCloseWhenBrowserNavigationChanged?: boolean;
    };

export default PopoverProps;
