import {render} from '@testing-library/react-native';

import {ChartCaptureContext, useReportChartCaptureLoading} from '@components/Charts/context/ChartCaptureContext';

import React from 'react';

function Chart({isLoading}: {isLoading: boolean}) {
    useReportChartCaptureLoading(isLoading);
    return null;
}

describe('ChartCaptureContext', () => {
    it('reports loading before paint and unregisters a chart when it unmounts', () => {
        // Given a dashboard with a loading chart
        const reportLoading = jest.fn<void, [string, boolean]>();
        const {rerender, unmount} = render(
            <ChartCaptureContext.Provider value={{isCapturing: false, reportLoading}}>
                <Chart isLoading />
            </ChartCaptureContext.Provider>,
        );

        // When its layout effects have run
        // Then export is blocked before the loading chart is painted
        const id = reportLoading.mock.calls.at(-1)?.at(0);
        expect(reportLoading).toHaveBeenLastCalledWith(id, true);

        // When the chart finishes rendering
        rerender(
            <ChartCaptureContext.Provider value={{isCapturing: false, reportLoading}}>
                <Chart isLoading={false} />
            </ChartCaptureContext.Provider>,
        );

        // Then the same chart no longer blocks export
        expect(reportLoading).toHaveBeenLastCalledWith(id, false);

        // When a later loading chart is removed
        rerender(
            <ChartCaptureContext.Provider value={{isCapturing: false, reportLoading}}>
                <Chart isLoading />
            </ChartCaptureContext.Provider>,
        );
        unmount();

        // Then its pending loading state is removed as well
        expect(reportLoading).toHaveBeenLastCalledWith(id, false);
    });
});
