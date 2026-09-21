import BlockingView from '@components/BlockingViews/BlockingView';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

type ChartEmptyStateProps = {
    testID?: string;
};

/** Stands in for a chart with too little data to plot. */
function ChartEmptyState({testID}: ChartEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Chart']);

    return (
        <BlockingView
            testID={testID}
            icon={illustrations.Chart}
            iconHeight={variables.iconSizeMegaLarge}
            title={translate('homePage.insightsSection.chartUnavailable')}
            titleStyles={[styles.mt0, styles.mb2]}
            subtitle={translate('homePage.insightsSection.notEnoughData')}
            subtitleStyle={styles.textSupporting}
            containerStyle={[{minHeight: CHART_CONTENT_MIN_HEIGHT}, styles.gap5, styles.pb5]}
            contentFitImage="contain"
        />
    );
}

export default ChartEmptyState;
