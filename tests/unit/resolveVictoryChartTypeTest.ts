import type {TNode} from 'react-native-render-html';
import {CHART_TYPE, LABEL_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import resolveVictoryChartType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveVictoryChartType';

jest.mock('@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree');

const mockProcessVictoryChartTree = processVictoryChartTree as jest.MockedFunction<typeof processVictoryChartTree>;

const mockTnode = {} as TNode;

function createProcessNodeResult(data: ProcessNodeResult['data']): ProcessNodeResult {
    return {
        data,
        xKey: X_KEY,
        yKeys: [],
        labelItems: [],
        legendItems: [],
    };
}

describe('resolveVictoryChartType', () => {
    beforeEach(() => {
        mockProcessVictoryChartTree.mockReturnValue(createProcessNodeResult({}));
    });

    it('returns null when data has both cartesian and polar keys', () => {
        mockProcessVictoryChartTree.mockReturnValue(
            createProcessNodeResult({
                mixed: {
                    [X_KEY]: 'Jan',
                    [LABEL_KEY]: 'Category',
                    y0: 100,
                    value: 100,
                    color: '#000',
                },
            }),
        );

        expect(resolveVictoryChartType(mockTnode, null)).toBeNull();
    });

    it('returns null when data has neither cartesian nor polar keys', () => {
        mockProcessVictoryChartTree.mockReturnValue(createProcessNodeResult({empty: {}} as ProcessNodeResult['data']));

        expect(resolveVictoryChartType(mockTnode, null)).toBeNull();
    });

    it('returns cartesian when data entries include x keys only', () => {
        mockProcessVictoryChartTree.mockReturnValue(
            createProcessNodeResult({
                series: {
                    [X_KEY]: 'Jan',
                    y0: 100,
                },
            }),
        );

        expect(resolveVictoryChartType(mockTnode, null)).toBe(CHART_TYPE.CARTESIAN);
    });

    it('returns polar when data entries include label keys only', () => {
        mockProcessVictoryChartTree.mockReturnValue(
            createProcessNodeResult({
                slice: {
                    [LABEL_KEY]: 'Travel',
                    value: 100,
                    color: '#000',
                },
            }),
        );

        expect(resolveVictoryChartType(mockTnode, null)).toBe(CHART_TYPE.POLAR);
    });
});
