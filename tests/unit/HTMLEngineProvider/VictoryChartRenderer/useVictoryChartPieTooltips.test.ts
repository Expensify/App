import {findSliceAtPosition, processDataIntoSlices} from '@components/Charts/utils';

function translateCursorToChartSpace(localX: number, localY: number, overlayOrigin: {left: number; top: number}) {
    return {x: localX + overlayOrigin.left, y: localY + overlayOrigin.top};
}

describe('translateCursorToChartSpace', () => {
    it('maps overlay-local coordinates to chart canvas coordinates', () => {
        expect(translateCursorToChartSpace(145, 145, {left: 195, top: 120})).toEqual({x: 340, y: 265});
    });
});

describe('pie plot overlay hit-testing', () => {
    it('finds the correct slice when pointer coords are translated from the plot overlay', () => {
        const pieGeometry = {centerX: 340, centerY: 265, radius: 145, innerRadius: 125};
        const overlayOrigin = {left: 195, top: 120};
        const data = [{label: 'Interest', total: 220}];
        const slices = processDataIntoSlices(data, pieGeometry, 270);

        const localX = 145;
        const localY = 10;
        const {x: chartX, y: chartY} = translateCursorToChartSpace(localX, localY, overlayOrigin);
        const sliceIndex = findSliceAtPosition(chartX, chartY, pieGeometry.centerX, pieGeometry.centerY, pieGeometry.radius, 125, slices);

        expect(sliceIndex).toBe(0);
    });
});
