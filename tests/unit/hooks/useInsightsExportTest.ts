import {act, render, renderHook, screen} from '@testing-library/react-native';

import {ChartCaptureContext, useReportChartCaptureLoading} from '@components/Charts/context/ChartCaptureContext';

import Log from '@libs/Log';

import exportInsightsDashboard from '@pages/Insights/exportInsightsDashboard';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import useInsightsExport from '@pages/Insights/useInsightsExport';

import CONST from '@src/CONST';

import {createElement} from 'react';
import {Alert, View} from 'react-native';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useTheme', () => () => ({appBG: '#ffffff'}));
jest.mock('@libs/Log', () => ({warn: jest.fn()}));
jest.mock('@pages/Insights/exportInsightsDashboard', () => jest.fn());
jest.mock('@pages/Insights/getInsightsExportFileName', () => () => 'Insights.png');

const filters: InsightsFilters = {date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'};

function LoadingChart({isLoading}: {isLoading: boolean}) {
    useReportChartCaptureLoading(isLoading);
    return null;
}

function Dashboard({isLoading, showChart = true}: {isLoading: boolean; showChart?: boolean}) {
    const {captureContext, isLoading: isChartLoading} = useInsightsExport(CONST.INSIGHTS.DASHBOARD.SPEND, filters);
    return createElement(
        ChartCaptureContext.Provider,
        {value: captureContext},
        createElement(View, {accessibilityLabel: isChartLoading ? 'loading' : 'ready'}),
        showChart && createElement(LoadingChart, {isLoading}),
    );
}

describe('useInsightsExport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 0;
        });
        jest.mocked(exportInsightsDashboard).mockResolvedValue(undefined);
    });

    afterEach(() => jest.restoreAllMocks());

    it('keeps chart loading registration stable across dashboard renders', () => {
        // Given a dashboard whose mounted chart reports loading through its capture context
        const {rerender} = render(createElement(Dashboard, {isLoading: true}));

        // When the dashboard rerenders while the chart is still loading
        rerender(createElement(Dashboard, {isLoading: true}));

        // Then registration settles without a render loop and export remains blocked
        expect(screen.getByLabelText('loading')).toBeTruthy();

        // When the chart finishes rendering
        rerender(createElement(Dashboard, {isLoading: false}));

        // Then it no longer blocks export
        expect(screen.getByLabelText('ready')).toBeTruthy();

        // When the chart starts loading again and is then removed
        rerender(createElement(Dashboard, {isLoading: true}));
        expect(screen.getByLabelText('loading')).toBeTruthy();
        rerender(createElement(Dashboard, {isLoading: true, showChart: false}));

        // Then cleanup removes its pending loading registration
        expect(screen.getByLabelText('ready')).toBeTruthy();
    });

    it('waits for every chart and removes unmounted loading charts', async () => {
        // Given two charts still loading their data or renderer
        const {result} = renderHook(() => useInsightsExport(CONST.INSIGHTS.DASHBOARD.SPEND, filters));
        act(() => {
            result.current.captureContext.reportLoading('data', true);
            result.current.captureContext.reportLoading('renderer', true);
        });

        // When only the data is ready
        act(() => result.current.captureContext.reportLoading('data', false));
        await act(async () => result.current.exportDashboard());

        // Then the remaining renderer still blocks export
        expect(result.current.isLoading).toBe(true);
        expect(exportInsightsDashboard).not.toHaveBeenCalled();

        // When the renderer becomes ready or its chart unmounts
        act(() => result.current.captureContext.reportLoading('renderer', false));
        await act(async () => result.current.exportDashboard());

        // Then export is allowed and uses the current theme and filename
        expect(exportInsightsDashboard).toHaveBeenCalledWith(expect.objectContaining({headerRef: result.current.headerRef, backgroundColor: '#ffffff', fileName: 'Insights.png'}));
        expect(result.current.isExporting).toBe(false);
    });

    it('keeps only one export in flight and restores the button after failure', async () => {
        // Given a ready dashboard whose capture has not finished
        const {result} = renderHook(() => useInsightsExport(CONST.INSIGHTS.DASHBOARD.SPEND, filters));
        const alert = jest.spyOn(Alert, 'alert');
        const logWarning = jest.spyOn(Log, 'warn');
        let rejectCapture: (error: Error) => void = () => {};
        jest.mocked(exportInsightsDashboard).mockImplementationOnce(
            () =>
                new Promise((resolve, reject) => {
                    rejectCapture = reject;
                }),
        );
        let firstExport: Promise<void>;
        await act(async () => {
            firstExport = result.current.exportDashboard();
            await Promise.resolve();
        });

        // When Export is pressed again before capture finishes
        await act(async () => result.current.exportDashboard());

        // Then no second image is created and transient chart interactions remain hidden
        expect(exportInsightsDashboard).toHaveBeenCalledTimes(1);
        expect(result.current.captureContext.isCapturing).toBe(true);

        // When capture fails
        await act(async () => {
            rejectCapture(new Error('Capture failed'));
            await firstExport;
        });

        // Then the button recovers, the generic error is shown, and retry can succeed
        expect(result.current.isExporting).toBe(false);
        expect(logWarning).toHaveBeenCalledWith('[Insights] Could not export dashboard', {error: 'Capture failed'});
        expect(alert).toHaveBeenCalledWith('common.genericErrorMessage');
        await act(async () => result.current.exportDashboard());
        expect(exportInsightsDashboard).toHaveBeenCalledTimes(2);
    });
});
