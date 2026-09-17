import type {Dimensions} from '@src/types/utils/Layout';

import type {ThemedExpandedChartLayout} from './useExpandedChartLayout';

type VictoryChartExpandedContentProps = {
    /** The measured area available to the expanded chart inside the modal */
    availableSize: Dimensions;

    /** Fitted/zoomed sizes computed by the modal for `availableSize` */
    layout: ThemedExpandedChartLayout;

    /** Whether the modal is visible — gestures are deactivated and zoom state is reset while closed */
    isVisible: boolean;

    /** Called when the user swipes the chart down on touch devices */
    onSwipeDown?: () => void;
};

export default VictoryChartExpandedContentProps;
