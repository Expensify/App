import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import HomeSectionEmptyState from '@pages/home/HomeSectionEmptyState';

import React from 'react';

type ChartEmptyStateProps = {
    testID?: string;

    /** Defaults to the generic chart unavailable title. */
    title?: string;

    /** Defaults to the generic not enough data message. */
    description?: string;
};

/** Stands in for a chart with too little data to plot. */
function ChartEmptyState({testID, title, description}: ChartEmptyStateProps) {
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Chart']);

    return (
        <HomeSectionEmptyState
            testID={testID}
            illustration={illustrations.Chart}
            title={title ?? translate('homePage.insightsSection.chartUnavailable')}
            description={description ?? translate('homePage.insightsSection.notEnoughData')}
        />
    );
}

export default ChartEmptyState;
