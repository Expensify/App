/** Decides how the Summary's Average row compares the summarized period to the item's own average. */
import type {InsightsDetailsSummary} from '@src/types/onyx';

/** Complete periods of history the comparison needs before the summarized one */
const MIN_AVERAGE_PERIOD_COUNT = 3;

type InsightsAverageComparison =
    | {
          /** Too little history to compare against */
          type: 'notEnoughHistory';
      }
    | {
          /** The item had no spend before, so any percentage would divide by zero */
          type: 'new';
      }
    | {
          type: 'change';

          /** Spend in the period minus the average */
          difference: number;

          /** Difference relative to the average, as a percentage without its sign */
          percentage: number;
      };

/** Returns how the period compares to the average, once there are enough complete periods behind it. */
function getInsightsAverageComparison({total, average, averagePeriodCount}: InsightsDetailsSummary): InsightsAverageComparison {
    if (average === null || averagePeriodCount < MIN_AVERAGE_PERIOD_COUNT) {
        return {type: 'notEnoughHistory'};
    }
    if (average === 0) {
        return {type: 'new'};
    }

    const difference = total - average;
    return {type: 'change', difference, percentage: (Math.abs(difference) / Math.abs(average)) * 100};
}

export {MIN_AVERAGE_PERIOD_COUNT};
export type {InsightsAverageComparison};
export default getInsightsAverageComparison;
