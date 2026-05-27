import {Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {TNode} from 'react-native-render-html';
import {Pie, PolarChart} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

type VictoryChartPieProps = {tnode: TNode};

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data} = useVictoryChartContext();
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();

    return (
        <Pie.Chart
            startAngle={270}
            innerRadius={30}
        >
            {(slice) => (
                <>
                    <Pie.Slice>
                        <Pie.Label
                            font={regularTypeface ? Skia.Font(regularTypeface, 20) : null}
                            color={'green'}
                        />
                    </Pie.Slice>
                </>
            )}
        </Pie.Chart>
    );
}

VictoryChartPie.displayName = 'VictoryChartPie';

export default VictoryChartPie;
