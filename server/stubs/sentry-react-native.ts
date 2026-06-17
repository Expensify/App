const noopSpan = {
    setAttribute: () => {},
    setAttributes: () => {},
    setStatus: () => {},
    end: () => {},
};

export function startInactiveSpan() {
    return noopSpan;
}

export function spanToJSON() {
    return {data: {}};
}

export const logger = {
    warn: () => {},
};

const Sentry = {
    startInactiveSpan,
    spanToJSON,
    logger,
};

export default Sentry;
