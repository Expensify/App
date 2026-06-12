import React from 'react';
import {View} from 'react-native';
import {ChartHeader} from '@components/Charts';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import type {SearchGroupBy} from './types';

function SearchChartWrapper({children, title, groupBy}: {children: React.ReactNode; title?: string; groupBy: SearchGroupBy}) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'CreditCard', 'Send', 'Folder', 'Basket', 'Tag', 'Calendar']);
    const {titleIconName} = CHART_GROUP_BY_CONFIG[groupBy];
    const titleIcon = icons[titleIconName];

    return (
        <View style={[styles.chartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />
            {children}
        </View>
    );
}

export default SearchChartWrapper;
