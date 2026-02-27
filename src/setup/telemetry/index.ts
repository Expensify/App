import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import {startSpan} from '@libs/telemetry/activeSpans';
import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, tracingIntegration} from '@libs/telemetry/integrations';
import processBeforeSendTransactions from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import pkg from '../../../package.json';
import makeDebugTransport from './debugTransport';

export default function (): void {
    // With Sentry enabled in dev mode, profiling on iOS and Android does not work
    // If you want to enable Sentry in dev, set ENABLE_SENTRY_ON_DEV=true in .env
    // or comment out the condition below
    if (isDevelopment() && !CONFIG.ENABLE_SENTRY_ON_DEV) {
        return;
    }

    const integrations = [navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration].filter((integration) => !!integration);

    Sentry.init({
        dsn: CONFIG.SENTRY_DSN,
        transport: isDevelopment() ? makeDebugTransport : undefined,
        tracesSampleRate: 1.0,
        // 1. Profiling for Android is currently disabled because it causes crashes sometimes.
        // 2. When updating the profile sample rate, make sure it will not blow up our current limit in Sentry.
        profilesSampleRate: Platform.OS === 'android' ? 0 : 0.3,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations,
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
        enableLogs: true,
    });

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });

    console.debug('[Telemetry] setup called, scheduling module init times collection');

    // Collect module init times captured by moduleInitPolyfill.ts.
    // Deferred to after the first render frame so startup modules have been lazily required
    // and their init times recorded before we snapshot them.
    requestAnimationFrame(() => {
        if (typeof __moduleInitTimes === 'undefined' || typeof __moduleNames === 'undefined') {
            return;
        }
        const topModules = Object.entries(__moduleInitTimes as Record<string, number>)
            .map(([id, ms]) => ({
                name: (__moduleNames as Record<string, string>)[id] ?? id,
                ms: Math.round(ms),
            }))
            .filter(({ms}) => ms >= 100)
            .sort((a, b) => b.ms - a.ms)
            .slice(0, 50);
        console.debug(`[Telemetry] Modules taking ≥100ms to init (all, incl. 3rd party) — count: ${topModules.length}`);
        for (const {name, ms} of topModules) {
            console.debug(`[Module]  ${ms}ms — ${name}`);
        }
        Sentry.addBreadcrumb({
            category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_MODULE_INIT,
            level: 'info',
            data: {modules: topModules},
        });
    });
}
