import {ChartFontsProvider} from '@components/Charts/hooks';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import getVictoryChartTreeTypeface from '@components/Charts/utils/getVictoryChartTreeTypeface';

import useHover from '@hooks/useHover';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasHoverSupport} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {VictoryChartRendererProps} from './types';

import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import VictoryChartExpandButton from './components/VictoryChartExpandButton';
import VictoryChartExpandModal from './components/VictoryChartExpandModal';
import {VictoryChartProvider} from './context/VictoryChartContext';
import processVictoryChartTree from './parsers/processVictoryChartTree';
import resolveVictoryChartType from './utils/resolveVictoryChartType';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    const fonts = useChartFonts();
    const styles = useThemeStyles();
    const [isExpanded, setIsExpanded] = useState(false);
    const {hovered, bind: hoverBind} = useHover();
    const deviceHasHoverSupport = hasHoverSupport();

    let processedResult;
    try {
        processedResult = processVictoryChartTree(tnode, getVictoryChartTreeTypeface(fonts.typefaces), null);
    } catch (error) {
        // Malformed chart HTML can make a parser throw. Fail closed (render nothing) instead of crashing the whole report.
        Log.warn('[VictoryChartRenderer] Failed to process chart tree from malformed HTML', {error});
        return null;
    }

    const type = resolveVictoryChartType(processedResult.data);
    if (!type) {
        Log.warn('Trying to render an invalid chart (empty or mixed chart types).');
        return null;
    }

    return (
        <ChartFontsProvider value={fonts}>
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={type}
            >
                {/* Wrapper anchors the absolutely-positioned expand button to the chart's corner.
                    mw100 keeps it from sizing to the chart's design width, so the responsive
                    container's onLayout measures the real available width (e.g. in the side panel). */}
                <View
                    style={styles.mw100}
                    onMouseEnter={hoverBind.onMouseEnter}
                    onMouseLeave={hoverBind.onMouseLeave}
                >
                    <VictoryChartContainer>
                        <VictoryChartContent />
                    </VictoryChartContainer>
                    {/* Shown on hover only (like receipt actions) on devices with hover support; always shown on touch devices. */}
                    <VictoryChartExpandButton
                        onPress={() => setIsExpanded(true)}
                        shouldShow={hovered || !deviceHasHoverSupport}
                    />
                </View>
                <VictoryChartExpandModal
                    isVisible={isExpanded}
                    onClose={() => setIsExpanded(false)}
                />
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
