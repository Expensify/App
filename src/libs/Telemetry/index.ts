import { Platform } from "react-native";
import * as api from "@opentelemetry/api";
import {
  defaultResource,
  resourceFromAttributes,
} from "@opentelemetry/resources";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { isDevelopment } from "@libs/Environment/Environment";
import pkg from '../../../package.json';

// Resource

/* eslint-disable @typescript-eslint/naming-convention */
const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: pkg.name,
      [ATTR_SERVICE_VERSION]: pkg.version,
      "deployment.environment.name":
        process.env.NODE_ENV,
      "os.name": Platform.OS, // ATTR_OS_NAME
      "os.version": Platform.Version, // ATTR_OS_VERSION
    })
  );

// Metrics

const logMetricReader = isDevelopment()
    ? new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
      })
    : null;

const otlpMetricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: `http://localhost:4318/v1/metrics`,
    headers: {
      "Content-Type": "application/json",
    },
  }),
});

const meterProvider = new MeterProvider({
  resource,
  readers: [logMetricReader, otlpMetricReader].filter(
    (reader) => reader !== null
  ),
});

// SDK

function openTelemetrySDK() {
    api.metrics.setGlobalMeterProvider(meterProvider);

    return api;
}

const sdk = openTelemetrySDK();

const meter = sdk.metrics.getMeter(pkg.name, pkg.version);

export default { sdk, meter };
