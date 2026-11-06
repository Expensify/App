type UseRemeasureOnScrollParams = {
    /** Whether anything is currently anchored and so worth keeping in place */
    isActive: boolean;

    /** Takes a fresh measurement of the anchor */
    remeasure: () => void;
};

type UseRemeasureOnScroll = (params: UseRemeasureOnScrollParams) => void;

export default UseRemeasureOnScroll;
