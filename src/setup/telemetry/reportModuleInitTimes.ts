import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

/**
 * Builds the top-N slowest modules from raw init time data, logs them, and
 * sends a Sentry breadcrumb. Shared by index.native.ts and index.web.ts.
 *
 * @param initTimes  moduleId → execution time in ms
 * @param names      optional moduleId → human-readable name (Metro provides this; webpack uses the ID as the name)
 * @param minMs      minimum ms threshold — modules below this are excluded
 */
function reportModuleInitTimes(initTimes: Record<string | number, number> | undefined, names: Record<string | number, string> | undefined, minMs: number): void {
    if (!initTimes || Object.keys(initTimes).length === 0) {
        return;
    }
    const topModules = Object.entries(initTimes)
        .map(([id, ms]) => ({
            name: names?.[id] ?? id,
            ms: Math.round(ms),
        }))
        .filter(({ms}) => ms >= minMs)
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 50);

    console.debug(`[Telemetry] Module init times ≥${minMs}ms (slowest first) — count: ${topModules.length}`);
    for (const {name, ms} of topModules) {
        console.debug(`[Module]  ${ms}ms — ${name}`);
    }

    Sentry.addBreadcrumb({
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_MODULE_INIT,
        level: 'info',
        data: {modules: topModules},
    });
}

export default reportModuleInitTimes;
