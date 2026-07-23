import {WRITE_COMMANDS} from '@libs/API/types';
import type {WriteCommand} from '@libs/API/types';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
import type {AnyRequest} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

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
// OpenApp only, deliberately not ReconnectApp: this group replaces the `IS_LOADING_APP` flag, which is set
// true only for OpenApp (see getOnyxDataForOpenOrReconnect in src/libs/actions/App.ts). Including ReconnectApp
// would make full-page loaders show during background reconnects (coming back online, update-gap sync), where
// the old flag stayed false. The top LoadingBar, which does show during reconnects, uses LOADING_BAR_COMMANDS.
const APP_LOAD_COMMANDS: WriteCommand[] = [WRITE_COMMANDS.OPEN_APP];
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

// Process-session memory: an OpenApp was seen in the queue this session and its deferred updates (whose
// finallyData clears IS_LOADING_APP) have not flushed yet. The sequential queue drops the request from
// PERSISTED_(ONGOING_)REQUESTS before it flushes those held updates, so `hasPendingOpenApp` alone goes
// false too early and the migrated screens would render cleared/stale data during that window. This latch
// keeps the gate pending across it. It is NOT a stored flag: a stranded IS_LOADING_APP read from disk on
// a fresh reload never sets it, because that reload runs ReconnectApp, not OpenApp. Keying on an observed
// OpenApp rather than HAS_LOADED_APP is what also covers an account switch, where HAS_LOADED_APP is
// already true but a real OpenApp still fires (see Delegate's atomic reset).
//
// This is deliberately module scoped, not a useRef: the observing consumer can unmount while the flush is
// still in progress (an account switch remounts screens), and a different consumer that mounts during the
// window must still see the latch. Reading a mutable module value during render is safe here because the
// only value the render combines it with is the reactive isLoadingApp, and the latch only changes inside
// the effect below, whose deps are exactly [hasPendingOpenApp, isLoadingApp]: any latch change is therefore
// accompanied by a dep change that re-renders every consumer, so no consumer can strand a stale read.
let hasObservedOpenAppFlushPending = false;

// Shared across hook instances so consumers mounting during a deferred flush observe the same lifecycle.
const reportIDsWithPendingOpenReportFlush = new Set<string>();

/** Whether an OpenApp request or its deferred Onyx updates are pending. */
function useIsAppLoadPending(): boolean {
    const hasPendingOpenApp = useIsPendingInternal('appLoad');
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    useEffect(() => {
        if (hasPendingOpenApp) {
            hasObservedOpenAppFlushPending = true;
        } else if (isLoadingApp !== true) {
            // The flag cleared, so the deferred OpenApp updates flushed: stop covering the window.
            hasObservedOpenAppFlushPending = false;
        }
    }, [hasPendingOpenApp, isLoadingApp]);

    return hasPendingOpenApp || (hasObservedOpenAppFlushPending && isLoadingApp === true);
}

/**
 * Whether an OpenReport request or its deferred Onyx updates are pending for the given report.
 *
 * Accepts `undefined` so callers with an optional reportID don't have to default the ID to a sentinel
 * value: an undefined scope key never matches a real OpenReport request, so it reads as "not loading".
 *
 * Do not call this inside list-item render paths (e.g. per row in a list): every call opens three Onyx
 * subscriptions. Lift it to the screen level and pass the result down instead.
 */
function useIsReportLoadPending(reportID: string | undefined): boolean {
    const hasPendingRequest = useIsPendingInternal('reportLoad', reportID);
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${getNonEmptyStringOnyxID(reportID)}`, {
        selector: isLoadingInitialReportActionsSelector,
    });

    // The queue arms this lifecycle, so a loading flag stranded by a previous process cannot gate by itself.
    // Once armed, the terminal flag keeps consumers gated until deferred response updates are flushed.
    useEffect(() => {
        if (!reportID) {
            return;
        }

        if (hasPendingRequest) {
            reportIDsWithPendingOpenReportFlush.add(reportID);
        } else if (isLoadingInitialReportActions !== true) {
            reportIDsWithPendingOpenReportFlush.delete(reportID);
        }
    }, [hasPendingRequest, isLoadingInitialReportActions, reportID]);

    return hasPendingRequest || (!!reportID && reportIDsWithPendingOpenReportFlush.has(reportID) && isLoadingInitialReportActions === true);
}

/** Whether any request relevant to the top-of-screen loading bar is currently in the queue. */
function useIsLoadingBarPending(): boolean {
    return useIsPendingInternal('loadingBar');
}

/**
 * Whether the LoadingBar should be visible: any loading-bar command is being processed and the app is online.
 */
function useLoadingBarVisibility(): boolean {
    const hasPendingLoadingBarRequest = useIsPendingInternal('loadingBar');
    const {isOffline} = useNetwork();

    // Don't show loading bar if currently offline
    return !isOffline && hasPendingLoadingBarRequest;
}

export {useIsAppLoadPending, useIsReportLoadPending, useIsLoadingBarPending, useLoadingBarVisibility};
