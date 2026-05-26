import React from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import renderVictoryChartLabelElements from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/renderVictoryChartLabelElements';

type VictoryChartLabelsProps = {
    labelItems: LabelItem[];
};

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 */
function VictoryChartLabels({labelItems}: VictoryChartLabelsProps) {
    const typefaces = useChartDefaultTypeface();

    return renderVictoryChartLabelElements({labelItems, typefaces});
}

VictoryChartLabels.displayName = 'VictoryChartLabels';

export default VictoryChartLabels;
