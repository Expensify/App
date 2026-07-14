import useOnyx from '@hooks/useOnyx';

import {WRITE_COMMANDS} from '@libs/API/types';
import type {WriteCommand} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Derives loading truth from the request queue.
 *
 * A "group" is a set of API commands whose presence in the queue means some part of the app is loading.
 * Each group reads the same two Onyx keys (the persisted queue and the single ongoing request) and reports
 * a single boolean. Groups can be scoped, so a caller only sees the requests it cares about (e.g. the
 * OpenReport request for one specific report, keyed by `reportID`).
 *
 * The public API is one dedicated hook per group. The generic that powers them stays internal so call
 * sites cannot pass the wrong scope key for a group.
 */

type PendingRequestGroupConfig = {
    /** Commands whose presence in the queue counts as "pending" for this group. */
    commands: Set<string>;

    /**
     * Extracts the scope key from a request for scoped groups (e.g. `reportID` for report loading).
     * Omitted for unscoped groups, which match on command alone. Returns `undefined` when the request
     * carries no usable scope key, which never matches a caller's scope key.
     */
    getScopeKey?: (request: AnyRequest) => string | number | undefined;

    /**
     * When true, persisted requests that were initiated while offline are ignored. Such requests sit in the
     * queue until the user reconnects, so they should not read as "loading". The ongoing request is never
     * filtered this way. This mirrors the exact semantics of the original `useLoadingBarVisibility` selectors.
     */
    ignoreOfflineInitiatedPersisted?: boolean;
};

// Only WRITE commands are pushed to the SequentialQueue (see `processRequest` in src/libs/API/index.ts);
// READ and side-effect commands are processed straight through the middleware and never land in
// PERSISTED_REQUESTS / PERSISTED_ONGOING_REQUESTS. Groups may therefore only contain WRITE_COMMANDS —
// a read/side-effect command here would make its hook permanently return false. Typing each command list
// as `WriteCommand[]` makes the type system enforce that invariant rather than relying on the comment.
const APP_LOAD_COMMANDS: WriteCommand[] = [WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP];
const REPORT_LOAD_COMMANDS: WriteCommand[] = [WRITE_COMMANDS.OPEN_REPORT];
const LOADING_BAR_COMMANDS: WriteCommand[] = [WRITE_COMMANDS.OPEN_APP, WRITE_COMMANDS.RECONNECT_APP, WRITE_COMMANDS.OPEN_REPORT, WRITE_COMMANDS.READ_NEWEST_ACTION];

const PENDING_REQUEST_GROUPS = {
    appLoad: {
        commands: new Set<string>(APP_LOAD_COMMANDS),
    },
    reportLoad: {
        commands: new Set<string>(REPORT_LOAD_COMMANDS),
        getScopeKey: (request) => (typeof request.data?.reportID === 'string' ? request.data.reportID : undefined),
    },
    loadingBar: {
        commands: new Set<string>(LOADING_BAR_COMMANDS),
        ignoreOfflineInitiatedPersisted: true,
    },
} satisfies Record<string, PendingRequestGroupConfig>;

type PendingRequestGroup = keyof typeof PENDING_REQUEST_GROUPS;

type PendingRequestSelectors = {
    /** Selector over the persisted request queue. */
    persisted: (requests: OnyxEntry<AnyRequest[]>) => boolean;

    /** Selector over the single ongoing request. */
    ongoing: (request: OnyxEntry<AnyRequest>) => boolean;
};

function buildSelectors(group: PendingRequestGroup, scopeKey?: string | number): PendingRequestSelectors {
    const config: PendingRequestGroupConfig = PENDING_REQUEST_GROUPS[group];
    const {commands, getScopeKey, ignoreOfflineInitiatedPersisted} = config;
    const matchesScope = (request: AnyRequest) => (getScopeKey ? getScopeKey(request) === scopeKey : true);

    return {
        persisted: (requests) =>
            !!requests?.some((request) => commands.has(request.command) && matchesScope(request) && (ignoreOfflineInitiatedPersisted ? !request.initiatedOffline : true)),
        ongoing: (request) => !!request && commands.has(request.command) && matchesScope(request),
    };
}

function useIsPendingInternal(group: PendingRequestGroup, scopeKey?: string | number): boolean {
    // React Compiler memoizes this call keyed on (group, scopeKey), so the selector references stay stable
    // across renders and `useOnyx` does not re-subscribe. Do not replace this with a manual selector cache.
    const {persisted, ongoing} = buildSelectors(group, scopeKey);
    const [hasPendingPersistedRequest] = useOnyx(ONYXKEYS.PERSISTED_REQUESTS, {selector: persisted});
    const [hasPendingOngoingRequest] = useOnyx(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, {selector: ongoing});

    return !!hasPendingPersistedRequest || !!hasPendingOngoingRequest;
}

/** Whether an app-load request (OpenApp / ReconnectApp) is currently in the queue. */
function useIsAppLoadPending(): boolean {
    return useIsPendingInternal('appLoad');
}

/**
 * Whether an OpenReport request for the given report is currently in the queue.
 *
 * Do not call this inside list-item render paths (e.g. per row in a list): every call opens two Onyx
 * subscriptions. Lift it to the screen level and pass the result down instead.
 */
function useIsReportLoadPending(reportID: string): boolean {
    return useIsPendingInternal('reportLoad', reportID);
}

/** Whether any request relevant to the top-of-screen loading bar is currently in the queue. */
function useIsLoadingBarPending(): boolean {
    return useIsPendingInternal('loadingBar');
}

export {useIsAppLoadPending, useIsReportLoadPending, useIsLoadingBarPending};
