import Button from '@components/ButtonComposed';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type VictoryChartExpandButtonProps = {
    /** Called when the user presses the expand button */
    onPress: () => void;

    /** Whether the button should be visible. It stays mounted (hidden via opacity) so hover in/out doesn't reflow the chart. */
    shouldShow: boolean;
};

function VictoryChartExpandButton({onPress, shouldShow}: VictoryChartExpandButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);

    return (
        <Tooltip text={translate('common.expand')}>
            {/* Overlays the chart's top-right corner without affecting the chart's layout. The button
                intentionally captures pointer events in that corner, suppressing any underlying chart
                gesture layer — acceptable since charts render nothing interactive there. */}
            <View style={[styles.pAbsolute, styles.t0, styles.r0, styles.m3, !shouldShow && styles.opacity0]}>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={onPress}
                    accessibilityLabel={translate('common.expand')}
                    sentryLabel={CONST.SENTRY_LABEL.HTML_RENDERER.VICTORY_CHART_EXPAND_BUTTON}
                >
                    <Button.Icon src={icons.Expand} />
                </Button>
            </View>
        </Tooltip>
    );
}

VictoryChartExpandButton.displayName = 'VictoryChartExpandButton';

export default VictoryChartExpandButton;
