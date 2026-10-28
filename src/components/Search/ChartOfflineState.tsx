import BlockingView from '@components/BlockingViews/BlockingView';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

/** Stands in for a chart that has no data stored and can't fetch any while offline. */
function ChartOfflineState() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);

    return (
        <BlockingView
            icon={icons.OfflineCloud}
            iconColor={theme.offline}
            iconWidth={variables.iconSizeUltraLarge}
            title={translate('common.youAppearToBeOffline')}
            titleStyles={[styles.mt0, styles.mb2]}
            subtitle={translate('common.thisFeatureRequiresInternet')}
            subtitleStyle={styles.textSupporting}
            containerStyle={[{minHeight: CHART_CONTENT_MIN_HEIGHT}, styles.gap5]}
        />
    );
}

export default ChartOfflineState;
