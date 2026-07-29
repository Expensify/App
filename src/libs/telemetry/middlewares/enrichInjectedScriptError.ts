import type {ErrorEvent} from '@sentry/core';

import type {TelemetryBeforeSendError} from './index';

/**
 * Native no-op. The enrichment reads `document`, `performance`, and `window.location`, all of which
 * only exist on web, so the whole implementation lives in `enrichInjectedScriptError.web.ts` and the
 * native bundle carries this pass-through instead.
 */
const enrichInjectedScriptError: TelemetryBeforeSendError = (event: ErrorEvent): ErrorEvent => event;

export default enrichInjectedScriptError;
