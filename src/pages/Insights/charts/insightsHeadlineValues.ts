/** Keeps the Efficiency summary and chart average on the same visible stages. */
import type {InsightsChartStage} from '@pages/Insights/dashboardSpecs';

import type {InsightsHeadlineSummary} from '@src/types/onyx/InsightsDashboard';

function getEfficiencyHeadlineStages(totals: InsightsHeadlineSummary['previous'], stages: readonly InsightsChartStage[] = []) {
    if (!totals || 'total' in totals || 'violations' in totals) {
        return [];
    }

    return stages.flatMap(({workflowStage, durationField}) => {
        const duration = totals[durationField];
        return typeof duration === 'number' ? [{workflowStage, duration}] : [];
    });
}

function getEfficiencyHeadlineAverage(stageValues: Readonly<ReturnType<typeof getEfficiencyHeadlineStages>>): number | undefined {
    return stageValues.length === 0 ? undefined : stageValues.reduce((total, stage) => total + stage.duration, 0);
}

export {getEfficiencyHeadlineAverage, getEfficiencyHeadlineStages};
