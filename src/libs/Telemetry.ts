import { openTelemetrySDK } from 'react-native-open-telemetry';
import pkg from '../../package.json';
import { getSession } from './SessionUtils';

const sdk = openTelemetrySDK({
  debug: true,
  url: "http://localhost:4318",
  name: pkg.name,
  version: pkg.version,
  features: {
    session: {
      getSessionId: () => {
        const session = getSession();
        return session?.authToken ? `${session.accountID}-${session.creationDate} : null;
      }
    }
  }
});

const tracer = sdk.trace.getTracer(pkg.name, pkg.version);
const meter = sdk.metrics.getMeter(pkg.name, pkg.version);

export default { sdk, tracer, meter };
