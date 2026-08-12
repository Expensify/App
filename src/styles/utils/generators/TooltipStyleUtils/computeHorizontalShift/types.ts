type ComputeHorizontalShift = (
    windowWidth: number,
    tooltipLeftEdge: number,
    componentWidth: number,
    tooltipWrapperLeft: number,
    tooltipWrapperWidth: number,
    computeHorizontalShiftForNative?: boolean,
) => number;

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {ComputeHorizontalShift};
