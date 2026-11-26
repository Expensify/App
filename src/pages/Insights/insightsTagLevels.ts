/** Builds the Top tags level options from the tag levels GetInsights lists for the dashboard's workspaces. */
import CONST from '@src/CONST';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

type InsightsTagLevelOption = {value: number; label: string};

/**
 * @param tagLevels - Levels GetInsights listed, or undefined until it responds
 * @returns one option per level, named when every workspace in scope gives the level the same name
 */
function getInsightsTagLevelOptions(tagLevels: InsightsTagLevel[] | undefined, getFallbackLabel: (level: number) => string): InsightsTagLevelOption[] {
    const levels = tagLevels ?? [];
    const count = Math.max(CONST.INSIGHTS.DEFAULT_TAG_LEVEL, ...levels.map(({level}) => level));
    return Array.from({length: count}, (_, index) => {
        const names = levels.find(({level}) => level === index + 1)?.names ?? [];
        return {value: index + 1, label: names.length === 1 ? names[0] : getFallbackLabel(index + 1)};
    });
}

/** Keeps a level that GetInsights listed for a workspace in scope, and falls back to the default level otherwise. */
function getFittingTagLevel(level: number, tagLevels: InsightsTagLevel[]): number {
    return level === CONST.INSIGHTS.DEFAULT_TAG_LEVEL || tagLevels.some((tagLevel) => tagLevel.level === level) ? level : CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
}

export {getFittingTagLevel, getInsightsTagLevelOptions};
export type {InsightsTagLevelOption};
