const noopSpan = {
    setAttribute: () => {},
    setAttributes: () => {},
    setStatus: () => {},
    end: () => {},
};

function startInactiveSpan() {
    return noopSpan;
}

function spanToJSON() {
    return {data: {}};
}

const logger = {
    warn: () => {},
};

const Sentry = {
    startInactiveSpan,
    spanToJSON,
    logger,
};

export {startInactiveSpan, spanToJSON, logger};
export default Sentry;
