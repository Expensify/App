import { openTelemetrySDK } from 'react-native-open-telemetry';
import pkg from '../../package.json';

const sdk = openTelemetrySDK({
  debug: true,
  url: "http://localhost:4318",
  name: pkg.name,
  version: pkg.version,
});

const tracer = sdk.trace.getTracer(pkg.name, pkg.version);
const meter = sdk.metrics.getMeter(pkg.name, pkg.version);

export default { sdk, tracer, meter };
