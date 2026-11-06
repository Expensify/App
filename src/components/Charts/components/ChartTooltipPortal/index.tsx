import type ChildrenProps from '@src/types/utils/ChildrenProps';

import ReactDOM from 'react-dom';

/** Renders the chart tooltip on the page body so no clipping ancestor (e.g. a ScrollView) can cut it off */
function ChartTooltipPortal({children}: ChildrenProps) {
    const body = document.querySelector('body');

    if (!body) {
        return null;
    }

    return ReactDOM.createPortal(children, body);
}

export default ChartTooltipPortal;
