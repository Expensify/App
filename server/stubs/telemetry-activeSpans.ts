const noopSpan = {
    setAttribute: () => {},
    setAttributes: () => {},
    setStatus: () => {},
    end: () => {},
};

function startSpan() {
    return noopSpan;
}

function endSpan() {}

function endSpanWithAttributes() {}

function getSpan() {
    return undefined;
}

function getSpanByPrefix() {}

function getSpanID() {
    return undefined;
}

function cancelSpan() {}

function cancelSpanByInstance() {}

function cancelAllSpans() {}

function cancelSpansByPrefix() {}

export {startSpan, endSpan, endSpanWithAttributes, getSpan, getSpanByPrefix, getSpanID, cancelSpan, cancelSpanByInstance, cancelAllSpans, cancelSpansByPrefix};
