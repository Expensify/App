import CONST from '@src/CONST';

import type {Client, ErrorEvent, Exception} from '@sentry/core';

/** Tags `thirdPartyErrorFilterIntegration` writes on an event whose every frame is foreign to our bundle. */
const THIRD_PARTY_TAGS: ErrorEvent['tags'] = {[CONST.TELEMETRY.TAGS.THIRD_PARTY_CODE]: true};

/** `type: undefined` is what marks an error event in the SDK types, as opposed to `'transaction'`. */
function buildErrorEvent(values: Exception[], tags: ErrorEvent['tags'] = THIRD_PARTY_TAGS): ErrorEvent {
    return {type: undefined, tags, exception: {values}};
}

// The noise filters' `processEvent` ignores its client argument, so an empty stub satisfies the signature without stubbing the SDK.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the filters never read the client, this only satisfies the hook signature
const sentryClientStub = Object.create(null) as Client;

export {THIRD_PARTY_TAGS, buildErrorEvent, sentryClientStub};
