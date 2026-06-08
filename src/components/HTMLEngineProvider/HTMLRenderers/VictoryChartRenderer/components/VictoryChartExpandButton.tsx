import React from 'react';
import {StyleSheet, View} from 'react-native';
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
        <View
            style={[StyleSheet.absoluteFillObject, styles.pointerEventsBoxNone, styles.chartExpandButtonOverlay]}
            testID="victory-chart-expand-button-overlay"
        >
            <IconButton
                src={icons.Expand}
                style={[styles.videoExpandButton, styles.chartExpandButton]}
                tooltipText={translate('videoPlayer.expand')}
                onPress={onPress}
                small
                sentryLabel={CONST.SENTRY_LABEL.VICTORY_CHART.EXPAND_BUTTON}
            />
        </View>
    );
}

VictoryChartExpandButton.displayName = 'VictoryChartExpandButton';

export default VictoryChartExpandButton;
