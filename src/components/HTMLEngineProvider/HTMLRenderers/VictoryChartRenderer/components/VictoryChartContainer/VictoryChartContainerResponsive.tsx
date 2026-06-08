import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import computeChartScale from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeChartScale';
import useThemeStyles from '@hooks/useThemeStyles';
import type {VictoryChartContainerLayout} from './types';
import VictoryChartContainerFixed from './VictoryChartContainerFixed';

function VictoryChartContainerResponsive({children, onExpandPress}: {children: React.ReactNode; onExpandPress?: () => void}) {
    const styles = useThemeStyles();
    const {chartContentStyles} = useVictoryChartContext();
    const [containerWidth, setContainerWidth] = useState(0);

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasDesignDimensions = designWidth !== undefined && designHeight !== undefined;

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    const scale = hasDesignDimensions ? computeChartScale(designWidth, containerWidth) : 1;

    const themeStyles = {
        container: styles.chartContainer,
        content: styles.chartContent,
        mw100: styles.mw100,
    };

    const layout: VictoryChartContainerLayout = hasDesignDimensions && designHeight ? {kind: 'scaled', designHeight, scale} : {kind: 'fluid'};

    if (!hasDesignDimensions) {
        return (
            <VictoryChartContainerFixed
                layout={layout}
                themeStyles={themeStyles}
                onExpandPress={onExpandPress}
            >
                {children}
            </VictoryChartContainerFixed>
        );
    }

    return (
        <View
            style={styles.mw100}
            onLayout={handleLayout}
        >
            <VictoryChartContainerFixed
                layout={layout}
                themeStyles={themeStyles}
                onExpandPress={onExpandPress}
            >
                {children}
            </VictoryChartContainerFixed>
        </View>
    );
}

VictoryChartContainerResponsive.displayName = 'VictoryChartContainerResponsive';

export default VictoryChartContainerResponsive;
