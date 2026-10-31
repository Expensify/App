/** Owns dashboard capture readiness and the lifetime of one export attempt. */
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import {getErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import type {InsightsDashboardID} from '@src/types/onyx';

import {useCallback, useRef, useState} from 'react';
import {Alert} from 'react-native';

import type {InsightsCaptureRef} from './exportInsightsDashboard/types';
import type {InsightsFilters} from './insightsFilters';

import getInsightsExportFileName from './getInsightsExportFileName';

function useInsightsExport(dashboardID: InsightsDashboardID, filters: InsightsFilters) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const headerRef: InsightsCaptureRef = useRef(null);
    const controlsRef: InsightsCaptureRef = useRef(null);
    const contentRef: InsightsCaptureRef = useRef(null);
    const [loadingCharts, setLoadingCharts] = useState<Set<string>>(() => new Set());
    const [isExporting, setIsExporting] = useState(false);
    const exportInFlight = useRef(false);

    const reportLoading = useCallback((id: string, isLoading: boolean) => {
        setLoadingCharts((current) => {
            if (current.has(id) === isLoading) {
                return current;
            }
            const next = new Set(current);
            if (isLoading) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    const exportDashboard = async () => {
        if (exportInFlight.current || loadingCharts.size > 0) {
            return;
        }
        exportInFlight.current = true;
        setIsExporting(true);
        try {
            // Let React remove tooltips and hover indicators before native or web takes a snapshot.
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            });
            const {default: exportInsightsDashboard} = await import('./exportInsightsDashboard');
            await exportInsightsDashboard({headerRef, controlsRef, contentRef, backgroundColor: theme.appBG, fileName: getInsightsExportFileName(dashboardID, filters.date, translate)});
        } catch (error) {
            Log.warn('[Insights] Could not export dashboard', {error: getErrorMessage(error)});
            Alert.alert(translate('common.genericErrorMessage'));
        } finally {
            exportInFlight.current = false;
            setIsExporting(false);
        }
    };

    return {headerRef, controlsRef, contentRef, isExporting, isLoading: loadingCharts.size > 0, exportDashboard, captureContext: {isCapturing: isExporting, reportLoading}};
}

export default useInsightsExport;
