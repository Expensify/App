import type PopoverProps from '@components/Popover/types';
import type {AnchorDimensions, AnchorPosition} from '@styles/index';

type PopoverWithMeasuredContentProps = Omit<PopoverProps, 'anchorPosition'> & {
    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: AnchorPosition;

    /** The dimension of anchor component */
    anchorDimensions?: AnchorDimensions;

    /** Whether we should change the vertical position if the popover's position is overflow */
    shouldSwitchPositionIfOverflow?: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    /** Whether we should should use top side for the anchor positioning */
    shouldMeasureAnchorPositionFromTop?: boolean;

    /** Whether to skip re-measurement when becoming visible (for components with static dimensions) */
    shouldSkipRemeasurement?: boolean;
};

export default PopoverWithMeasuredContentProps;
