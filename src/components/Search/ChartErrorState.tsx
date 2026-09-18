import BlockingView from '@components/BlockingViews/BlockingView';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

type ChartErrorStateProps = {
    /** Asks for the chart's data again */
    onRetry: () => void;
};

/** Stands in for a chart whose data failed to arrive, sized to the chart it replaces so the card keeps its height. */
function ChartErrorState({onRetry}: ChartErrorStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);

    return (
        <BlockingView
            icon={illustrations.BrokenMagnifyingGlass}
            iconHeight={variables.iconSizeMegaLarge}
            title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
            titleStyles={[styles.mt0, styles.mb2]}
            subtitle={translate('errorPage.subtitle')}
            subtitleStyle={styles.textSupporting}
            containerStyle={[{minHeight: CHART_CONTENT_MIN_HEIGHT}, styles.gap5, styles.pb5]}
            contentFitImage="contain"
            buttonTranslationKey="common.tryAgain"
            onButtonPress={onRetry}
        />
    );
}

export default ChartErrorState;
