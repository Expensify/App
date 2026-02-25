import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import { PerformanceObserver } from "react-native-performance";
import { isDevelopment } from "@libs/Environment/Environment";
import { startSpan } from "@libs/telemetry/activeSpans";
import {
  breadcrumbsIntegration,
  browserProfilingIntegration,
  consoleIntegration,
  navigationIntegration,
  tracingIntegration,
} from "@libs/telemetry/integrations";
import processBeforeSendTransactions from "@libs/telemetry/middlewares";
import CONFIG from "@src/CONFIG";
import CONST from "@src/CONST";
import pkg from "../../../package.json";
import makeDebugTransport from "./debugTransport";

export default function (): void {
  // With Sentry enabled in dev mode, profiling on iOS and Android does not work
  // If you want to enable Sentry in dev, set ENABLE_SENTRY_ON_DEV=true in .env
  // or comment out the condition below
  if (isDevelopment() && !CONFIG.ENABLE_SENTRY_ON_DEV) {
    return;
  }

  const integrations = [
    navigationIntegration,
    tracingIntegration,
    browserProfilingIntegration,
    breadcrumbsIntegration,
    consoleIntegration,
  ].filter((integration) => !!integration);

  Sentry.init({
    dsn: CONFIG.SENTRY_DSN,
    transport: isDevelopment() ? makeDebugTransport : undefined,
    tracesSampleRate: 1.0,
    // 1. Profiling for Android is currently disabled because it causes crashes sometimes.
    // 2. When updating the profile sample rate, make sure it will not blow up our current limit in Sentry.
    profilesSampleRate: Platform.OS === "android" ? 0 : 0.3,
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

  // Collect module init times captured by moduleInitPolyfill.js once the JS bundle finishes loading.
  // Use a PerformanceObserver with buffered: true so it fires when CONTENT_APPEARED flushes
  // the native mark buffer to JS (the runJsBundleEnd mark is available by then).
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "runJsBundleEnd") {
        observer.disconnect();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defCount = (global as any).__moduleDefCount ?? "N/A";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const timesCount =
          typeof __moduleInitTimes !== "undefined"
            ? Object.keys(__moduleInitTimes).length
            : "undefined";
        console.log(
          `[Telemetry] moduleInitPolyfill: __d calls intercepted=${defCount}, factories executed=${timesCount}`,
        );

        if (
          typeof __moduleInitTimes !== "undefined" &&
          typeof __moduleNames !== "undefined"
        ) {
          const top20 = Object.entries(__moduleInitTimes)
            .map(([id, ms]) => ({
              name: __moduleNames?.[Number(id)] ?? id,
              ms: Math.round(ms),
            }))
            .sort((a, b) => b.ms - a.ms)
            .slice(0, 20);
          console.log("[Telemetry] Top 20 slowest module init times:");
          top20.forEach(({ name, ms }, i) =>
            console.log(`[Module]  ${i + 1}. ${ms}ms — ${name}`),
          );
          Sentry.addBreadcrumb({
            category: "module.init",
            level: "info",
            data: { modules: top20 },
          });
        }
      }
    }
  });
  observer.observe({ type: "react-native-mark", buffered: true });
}
