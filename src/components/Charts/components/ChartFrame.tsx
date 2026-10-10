import type {ReactNode} from 'react';

import React from 'react';

import ChartReveal from './ChartReveal';
import ChartWidthBox from './ChartWidthBox';

type ChartFrameProps = {
    isLoading?: boolean;
    hasData: boolean;

    /** Must match the loaded chart's height, or the card jumps at the reveal. */
    loadingHeight: number;

    /** Receives the card's width, or null until the card has been measured. */
    children: (chartWidth: number | null) => ReactNode;
};

function ChartFrame({isLoading = false, hasData, loadingHeight, children}: ChartFrameProps) {
    // A chart that loads empty collapses at once, so it never starts the engine download or holds a spinner over nothing
    if (!isLoading && !hasData) {
        return null;
    }

    return <ChartWidthBox>{(chartWidth) => <ChartReveal loadingHeight={loadingHeight}>{children(chartWidth)}</ChartReveal>}</ChartWidthBox>;
}

export default ChartFrame;
