import {getGlobalSpanAttributes} from '@libs/telemetry/globalSpanAttributes';

import type {TelemetryBeforeSend} from './index';

/**
 * Adds the global span attributes to the transaction and all its child spans, so every span carries them in Sentry.
 * If a span already has an attribute with the same name, its own value is kept.
 */
const attachGlobalSpanAttributes: TelemetryBeforeSend = (event) => {
    const attributes = getGlobalSpanAttributes();
    if (Object.keys(attributes).length === 0) {
        return event;
    }

    const updatedEvent = {...event};

    const trace = event.contexts?.trace;
    if (trace) {
        // The root span keeps its attributes in the trace context.
        updatedEvent.contexts = {...event.contexts, trace: {...trace, data: {...attributes, ...trace.data}}};
    }

    if (event.spans && event.spans.length > 0) {
        updatedEvent.spans = event.spans.map((span) => ({...span, data: {...attributes, ...span.data}}));
    }

    return updatedEvent;
};

export default attachGlobalSpanAttributes;
