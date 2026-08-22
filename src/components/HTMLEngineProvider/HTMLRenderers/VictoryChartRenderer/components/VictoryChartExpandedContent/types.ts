import type {Dimensions} from '@src/types/utils/Layout';

type VictoryChartExpandedContentProps = {
    /** The measured area available to the expanded chart inside the modal */
    availableSize: Dimensions;

    /** Whether the modal is visible — the chart canvas is removed while closing to avoid a white flash */
    isVisible: boolean;
};

export type {VictoryChartExpandedContentProps};
