import type PopoverProps from '@components/Popover/types';

import type {AnchorDimensions, AnchorPosition} from '@styles/index';

type PopoverWithMeasuredContentProps = Omit<PopoverProps, 'anchorPosition'> & {
    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: AnchorPosition;

    anchorDimensions?: AnchorDimensions;

    /** Whether we should change the vertical position if the popover's position is overflow */
    shouldSwitchPositionIfOverflow?: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    shouldMeasureAnchorPositionFromTop?: boolean;

    /** Whether to skip re-measurement when becoming visible (for components with static dimensions) */
    shouldSkipRemeasurement?: boolean;

    /**
     * Breathing room (in px) to keep between the popover and the window edges when it must be clamped inside the
     * window. Content that can't shrink (e.g. the calendar) would otherwise sit flush against the edge; a positive
     * value keeps the same gap the shrinking pickers leave. Defaults to 0 (flush), preserving existing behavior.
     */
    windowMargin?: number;
};

export default PopoverWithMeasuredContentProps;
