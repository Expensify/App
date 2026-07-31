import CONST from '@src/CONST';

import type {FetchBreadcrumbHint, Span, XhrBreadcrumbHint} from '@sentry/core';

function getNumericFormField(body: FormData, key: string): number | undefined {
    const value = Number(body.getAll(key).at(0));
    return Number.isFinite(value) ? value : undefined;
}

/**
 * Runs on Sentry's `beforeOutgoingRequestSpan` hook. The hook hint holds the request arguments, so this function reads
 * the update-ID range from the `FormData` body and stamps the range on the auto-instrumented `http.client` span.
 * A range that advances means the client is catching up. A range that repeats means the client is stuck in a loop.
 */
function stampUpdateIDRange(span: Pick<Span, 'setAttributes'>, hint: FetchBreadcrumbHint | XhrBreadcrumbHint): void {
    const requestInit: unknown = Array.isArray(hint.input) ? hint.input.at(1) : undefined;
    const body = requestInit && typeof requestInit === 'object' && 'body' in requestInit ? requestInit.body : undefined;

    if (!(body instanceof FormData)) {
        return;
    }

    const updateIDFrom = getNumericFormField(body, 'updateIDFrom');

    if (updateIDFrom === undefined) {
        return;
    }

    span.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_FROM]: updateIDFrom,
        [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_TO]: getNumericFormField(body, 'updateIDTo'),
    });
}

export default stampUpdateIDRange;
