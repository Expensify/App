/** Lets a dashboard wait for chart rendering and omit transient interactions from its image. */
import {createContext, useContext, useId, useLayoutEffect} from 'react';

type ChartCaptureContextValue = {
    isCapturing: boolean;
    reportLoading: (id: string, isLoading: boolean) => void;
};

const ChartCaptureContext = createContext<ChartCaptureContextValue | null>(null);

function useIsCapturingChart() {
    return useContext(ChartCaptureContext)?.isCapturing ?? false;
}

function useReportChartCaptureLoading(isLoading: boolean) {
    const reportLoading = useContext(ChartCaptureContext)?.reportLoading;
    const id = useId();

    useLayoutEffect(() => {
        reportLoading?.(id, isLoading);
    }, [id, isLoading, reportLoading]);

    useLayoutEffect(() => () => reportLoading?.(id, false), [id, reportLoading]);
    return !!reportLoading;
}

export {ChartCaptureContext, useIsCapturingChart, useReportChartCaptureLoading};
