import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {Portal} from '@gorhom/portal';
import React from 'react';

/** Renders the chart tooltip in the root portal host so no clipping ancestor (e.g. a ScrollView) can cut it off */
function ChartTooltipPortal({children}: ChildrenProps) {
    return <Portal>{children}</Portal>;
}

export default ChartTooltipPortal;
