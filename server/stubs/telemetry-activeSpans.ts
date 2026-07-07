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

function cancelSpan() {}

function cancelAllSpans() {}

function cancelSpansByPrefix() {}

export {startSpan, endSpan, endSpanWithAttributes, getSpan, cancelSpan, cancelAllSpans, cancelSpansByPrefix};
