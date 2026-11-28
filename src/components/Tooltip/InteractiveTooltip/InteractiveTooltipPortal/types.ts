import type {InteractiveTooltipActionsContextValue} from '@components/Tooltip/InteractiveTooltip/InteractiveTooltipContext';

import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';

import type {ReactNode} from 'react';
import type {LayoutRectangle} from 'react-native';

type InteractiveTooltipPortalProps = {
    children: ReactNode;
    anchorBounds: LayoutRectangle;

    /** Renders the outside-press dismiss overlay when opened explicitly rather than via hover or focus. */
    isPinned: boolean;
    actionsValue: InteractiveTooltipActionsContextValue;
    anchorAlignment?: TooltipAnchorAlignment;

    /** Maximum tooltip width in px. Falls back to `0` (unconstrained) when omitted. */
    maxWidth?: number;

    /** Horizontal offset in px (positive shifts right, negative shifts left), defaults to `0`. */
    shiftHorizontal?: number;

    /** Vertical offset in px (positive shifts down, negative shifts up), defaults to `0`. */
    shiftVertical?: number;
    shouldForceRenderingBelow?: boolean;

    /** Native only: mounts the portal into the `'modal'` PortalHost, defaults to `false`. */
    shouldTeleportPortalToModalLayer?: boolean;
};

export default InteractiveTooltipPortalProps;
