/** Decides how the Summary's Average row compares the summarized period to the item's own average. */
import type {InsightsDetailsSummary} from '@src/types/onyx';

/** Complete periods of history the comparison needs before the summarized one */
const MIN_AVERAGE_PERIOD_COUNT = 3;

const INSIGHTS_AVERAGE_COMPARISON = {
    NOT_ENOUGH_HISTORY: 'notEnoughHistory',
    NEW: 'new',
    CHANGE: 'change',
} as const;

type InsightsAverageComparison =
    | {
          type: typeof INSIGHTS_AVERAGE_COMPARISON.NOT_ENOUGH_HISTORY;
      }
    | {
          /** The item had no spend before, so any percentage would divide by zero */
          type: typeof INSIGHTS_AVERAGE_COMPARISON.NEW;
      }
    | {
          type: typeof INSIGHTS_AVERAGE_COMPARISON.CHANGE;

          /** Spend in the period minus the average */
          difference: number;

          /** Difference relative to the average, as a percentage without its sign */
          percentage: number;
      };

/** Returns how the period compares to the average, once there are enough complete periods behind it. */
function getInsightsAverageComparison({total, average, averagePeriodCount}: InsightsDetailsSummary): InsightsAverageComparison {
    if (average === null || averagePeriodCount < MIN_AVERAGE_PERIOD_COUNT) {
        return {type: INSIGHTS_AVERAGE_COMPARISON.NOT_ENOUGH_HISTORY};
    }
    if (average === 0) {
        return {type: INSIGHTS_AVERAGE_COMPARISON.NEW};
    }

    const difference = total - average;
    return {type: INSIGHTS_AVERAGE_COMPARISON.CHANGE, difference, percentage: (Math.abs(difference) / average) * 100};
}

export {INSIGHTS_AVERAGE_COMPARISON, MIN_AVERAGE_PERIOD_COUNT};
export type {InsightsAverageComparison};
export default getInsightsAverageComparison;
