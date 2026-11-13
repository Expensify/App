/** Keeps the two Compliance chart selections independent without changing dashboard-wide filters. */
import CONST from '@src/CONST';
import type {InsightsGraphKey} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

type InsightsViolationStage = ValueOf<typeof CONST.INSIGHTS.VIOLATION_STAGE>;
type InsightsViolationStageGraphKey = typeof CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME | typeof CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS;
type InsightsViolationStages = Record<InsightsViolationStageGraphKey, InsightsViolationStage>;

const DEFAULT_INSIGHTS_VIOLATION_STAGES: InsightsViolationStages = {
    [CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME]: CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED,
    [CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS]: CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED,
};

function isViolationStageSelectable(graphKey: InsightsGraphKey): graphKey is InsightsViolationStageGraphKey {
    return graphKey === CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME || graphKey === CONST.INSIGHTS.GRAPH.TOP_VIOLATIONS;
}

export {DEFAULT_INSIGHTS_VIOLATION_STAGES, isViolationStageSelectable};
export type {InsightsViolationStage, InsightsViolationStageGraphKey, InsightsViolationStages};
