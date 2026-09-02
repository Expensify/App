import type {Dimensions} from '@src/types/utils/Layout';

type VictoryChartExpandedContentProps = {
    /** The measured area available to the expanded chart inside the modal */
    availableSize: Dimensions;

    /** Whether the modal is visible — gestures are deactivated and zoom state is reset while closed */
    isVisible: boolean;

    /** Called when the user swipes the chart down on touch devices, matching the attachment viewer */
    onSwipeDown?: () => void;
};

export default VictoryChartExpandedContentProps;
