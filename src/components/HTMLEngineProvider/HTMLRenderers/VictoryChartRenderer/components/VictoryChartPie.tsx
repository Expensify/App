import React, {useMemo} from 'react';
import {useAmbientTRenderEngine} from 'react-native-render-html';
import type {TNode} from 'react-native-render-html';
import {Pie} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import type {PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data} = useVictoryChartContext();
    const renderEngine = useAmbientTRenderEngine();
    const innerRadius = tnode.attributes.innerradius !== undefined ? Number(parseAttribute(tnode.attributes.innerradius)) : undefined;
    const radius = tnode.attributes.radius !== undefined ? Number(parseAttribute(tnode.attributes.radius)) : undefined;
    const size = radius ? radius * 2 : undefined;
    const labelRadius = tnode.attributes.labelradius !== undefined ? Number(parseAttribute(tnode.attributes.labelradius)) : undefined;

    const pieLabelConfig = useMemo(() => {
        const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel');
        const labelItemTemplate = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;
        const dataLabels = Object.values(data).map((entry) => (entry as PolarChartData).label);
        const labels = parseAttribute<string[]>(tnode.attributes.labels);

        return {labelItemTemplate, dataLabels, labels};
    }, [data, renderEngine, tnode.attributes.labelcomponent, tnode.attributes.labels]);

    return (
        <Pie.Chart
            startAngle={START_ANGLE}
            innerRadius={innerRadius}
            size={size}
        >
            {({slice}) => (
                <Pie.Slice>
                    <VictoryChartPieLabel
                        slice={slice}
                        labelItemTemplate={pieLabelConfig.labelItemTemplate}
                        dataLabels={pieLabelConfig.dataLabels}
                        labels={pieLabelConfig.labels}
                        labelRadius={labelRadius}
                    />
                </Pie.Slice>
            )}
        </Pie.Chart>
    );
}

VictoryChartPie.displayName = 'VictoryChartPie';

export default VictoryChartPie;
