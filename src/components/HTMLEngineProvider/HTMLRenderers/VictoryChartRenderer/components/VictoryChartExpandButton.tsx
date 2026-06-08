import React from 'react';
import IconButton from '@components/VideoPlayer/IconButton';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type VictoryChartExpandButtonProps = {
    onPress: () => void;
};

function VictoryChartExpandButton({onPress}: VictoryChartExpandButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <IconButton
            src={icons.Expand}
            style={[styles.videoExpandButton, styles.chartExpandButton]}
            tooltipText={translate('videoPlayer.expand')}
            onPress={onPress}
            small
            sentryLabel={CONST.SENTRY_LABEL.VICTORY_CHART.EXPAND_BUTTON}
        />
    );
}

VictoryChartExpandButton.displayName = 'VictoryChartExpandButton';

export default VictoryChartExpandButton;
