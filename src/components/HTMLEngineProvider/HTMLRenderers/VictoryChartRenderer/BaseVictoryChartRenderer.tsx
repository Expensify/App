import React from 'react';
import type {VictoryChartRendererProps} from './types';
import getYKey from './utils/getYKey';
import VictoryChart from './VictoryChart';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    return (
        <VictoryChart.Provider tnode={tnode}>
            <VictoryChart.Container>
                <VictoryChart.Cartesian>
                    {(renderArgs) => (
                        <VictoryChart.RenderArgsProvider value={renderArgs}>
                            {tnode.children.map((child) => (
                                <VictoryChart.Series
                                    key={`${child.tagName ?? 'node'}-${getYKey(child)}`}
                                    tnode={child}
                                />
                            ))}
                        </VictoryChart.RenderArgsProvider>
                    )}
                </VictoryChart.Cartesian>
            </VictoryChart.Container>
        </VictoryChart.Provider>
    );
}

BaseVictoryChartRenderer.displayName = 'BaseVictoryChartRenderer';

export default BaseVictoryChartRenderer;
