import {CHART_TYPE, LABEL_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import resolveVictoryChartType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveVictoryChartType';

describe('resolveVictoryChartType', () => {
    it('returns null when data has both cartesian and polar keys', () => {
        const data: ProcessNodeResult['data'] = {
            mixed: {
                [X_KEY]: 'Jan',
                [LABEL_KEY]: 'Category',
                y0: 100,
                value: 100,
                color: '#000',
            },
        };

        expect(resolveVictoryChartType(data)).toBeNull();
    });

    it('returns null when data has neither cartesian nor polar keys', () => {
        expect(resolveVictoryChartType({})).toBeNull();
    });

    it('returns cartesian when data entries include x keys only', () => {
        const data: ProcessNodeResult['data'] = {
            series: {
                [X_KEY]: 'Jan',
                y0: 100,
            },
        };

        expect(resolveVictoryChartType(data)).toBe(CHART_TYPE.CARTESIAN);
    });

    it('returns polar when data entries include label keys only', () => {
        const data: ProcessNodeResult['data'] = {
            slice: {
                [LABEL_KEY]: 'Travel',
                value: 100,
                color: '#000',
            },
        };

        expect(resolveVictoryChartType(data)).toBe(CHART_TYPE.POLAR);
    });
});
