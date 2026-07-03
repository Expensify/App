import Navigation from '@libs/Navigation/Navigation';
import getMemoryInfo from '@libs/telemetry/getMemoryInfo';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * Browser crash diagnostics (web only).
 *
 * A tab crash ("Aw, Snap!", typically an out-of-memory kill) terminates JS instantly, so nothing can be
 * reported at crash time. Instead, every session continuously persists a heartbeat plus a ring buffer of
 * memory/DOM samples to localStorage. On the next app start (or from another live tab), sessions that
 * stopped sending heartbeats without a clean exit are reported to Sentry together with their final samples,
 * showing what the user was doing and what was growing right before the tab died.
 *
 * localStorage is used instead of Onyx on purpose: the clean-exit marker must be written synchronously
 * during pagehide, and the records must survive Onyx.clear() on sign-out.
 */
import * as Sentry from '@sentry/react-native';
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

const STORAGE_KEY_PREFIX = 'crashDiagnostics_session_';
const SAMPLE_INTERVAL_MS = 15 * 1000;

// ~15 minutes of history at one sample per 15 seconds
const MAX_SAMPLES = 60;

// Background tabs throttle timers to roughly one run per minute, so a live but hidden tab can be silent
// for a while. Only sessions silent for longer than this are considered dead.
const STALE_HEARTBEAT_MS = 5 * 60 * 1000;

const BYTES_PER_MB = 1024 * 1024;

const MS_PER_MINUTE = 60 * 1000;

// A stale heartbeat alone cannot tell a crash apart from a tab that was merely suspended (laptop sleep,
// paused background timers). Before reporting, give a possibly-suspended owner this long to prove it is
// still alive by resuming and announcing liveness or refreshing its heartbeat.
const LIVENESS_GRACE_MS = 10 * 1000;

// How recently a session must have announced itself over the liveness channel to still count as alive.
const LIVENESS_FRESHNESS_MS = 2 * 60 * 1000;

const LIVENESS_CHANNEL_NAME = 'crashDiagnosticsLiveness';

/** A point-in-time snapshot of memory/DOM/route state, captured on every heartbeat to reconstruct what was growing before a crash. */
type HeapSample = {
    /** When the sample was taken, as epoch ms. */
    timestamp: number;

    /** JS heap currently in use, in MB. Null when `performance.memory` is unavailable (non-Chromium browsers). */
    usedJSHeapSizeMB: number | null;

    /** Total allocated JS heap (used + free), in MB. Null when `performance.memory` is unavailable. */
    totalJSHeapSizeMB: number | null;

    /** Hard ceiling the JS heap can grow to before the tab is OOM-killed, in MB. Null when `performance.memory` is unavailable. */
    jsHeapSizeLimitMB: number | null;

    /** Total number of DOM nodes in the document — a proxy for view-tree growth/leaks. */
    domNodes: number;

    /** Active route (without params) at sample time, to show where the user was. */
    route: string;

    /** Number of reports in Onyx at sample time — a proxy for dataset size. Null before the Onyx connection has delivered a value. */
    reportsCount: number | null;

    /** Page visibility at sample time; distinguishes foreground activity from background/hidden tabs. */
    visibility: DocumentVisibilityState;
};

/** Everything persisted to localStorage for a single tab session: identity, liveness markers, and its ring buffer of samples. */
type SessionRecord = {
    /** Unique id for this tab session (one per `initializeCrashDiagnostics` call). */
    id: string;

    /** When the session started, as epoch ms. */
    startedAt: number;

    /** Epoch ms of the most recent heartbeat or exit-state write; staleness of this is the primary crash signal. */
    lastHeartbeat: number;

    /** True while the page is in a state where missing heartbeats are expected (pagehide/freeze) */
    cleanExit: boolean;

    /** Ring buffer of recent samples, capped at `MAX_SAMPLES` (oldest dropped first). */
    samples: HeapSample[];
};

/** Cross-tab liveness protocol: a tab pings when deciding whether a peer crashed; live peers answer. */
type LivenessMessage =
    /** Sent by a tab that is deciding whether a silent peer crashed; recipients reply with `alive`. */
    | {type: 'ping'}
    /** A live tab's reply, identifying itself so the asking tab can mark it recently-alive. */
    | {type: 'alive'; id: string};

let sessionRecord: SessionRecord | undefined;
let sampleIntervalID: ReturnType<typeof setInterval> | undefined;
let reportsCount: number | null = null;
let reportsConnection: ReturnType<typeof Onyx.connectWithoutView> | undefined;
let livenessChannel: BroadcastChannel | undefined;

// Sessions that announced liveness over the channel, keyed by session id -> last-seen epoch ms
const sessionsLastSeenAlive = new Map<string, number>();

// In-flight "is this session really dead?" checks, keyed by session id -> grace timeout handle
const pendingDeadChecks = new Map<string, ReturnType<typeof setTimeout>>();

function markCleanExit() {
    markExitState(true);
}

function markActive() {
    markExitState(false);
}

function isStorageAvailable(): boolean {
    try {
        return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
        // Accessing localStorage can throw (e.g. blocked by browser settings)
        return false;
    }
}

function isSessionRecord(value: unknown): value is SessionRecord {
    return typeof value === 'object' && value !== null && 'id' in value && 'lastHeartbeat' in value && 'cleanExit' in value && 'samples' in value && Array.isArray(value.samples);
}

function readSessionRecord(storageKey: string): SessionRecord | undefined {
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            return undefined;
        }
        const parsed: unknown = JSON.parse(raw);
        return isSessionRecord(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

function persistSessionRecord() {
    if (!sessionRecord) {
        return;
    }
    try {
        window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionRecord.id}`, JSON.stringify(sessionRecord));
    } catch {
        // Quota errors etc. — diagnostics must never break the app
    }
}

function markExitState(cleanExit: boolean) {
    if (!sessionRecord) {
        return;
    }
    sessionRecord.cleanExit = cleanExit;
    sessionRecord.lastHeartbeat = Date.now();
    persistSessionRecord();
}

function getActiveRouteSafe(): string {
    try {
        return Navigation.getActiveRouteWithoutParams();
    } catch {
        return '';
    }
}

function isBroadcastChannelAvailable(): boolean {
    return typeof BroadcastChannel !== 'undefined';
}

function isLivenessMessage(value: unknown): value is LivenessMessage {
    return typeof value === 'object' && value !== null && 'type' in value && (value.type === 'ping' || value.type === 'alive');
}

function announceLiveness() {
    if (!livenessChannel || !sessionRecord) {
        return;
    }
    const message: LivenessMessage = {type: 'alive', id: sessionRecord.id};
    livenessChannel.postMessage(message);
}

function requestLiveness() {
    if (!livenessChannel) {
        return;
    }
    const message: LivenessMessage = {type: 'ping'};
    livenessChannel.postMessage(message);
}

function handleLivenessMessage(event: MessageEvent) {
    const data: unknown = event.data;
    if (!isLivenessMessage(data)) {
        return;
    }
    if (data.type === 'ping') {
        // Another tab is deciding whether we crashed — prove we are alive
        announceLiveness();
        return;
    }
    if (data.id !== sessionRecord?.id) {
        sessionsLastSeenAlive.set(data.id, Date.now());
    }
}

function isSessionRecentlyAlive(sessionID: string): boolean {
    const lastSeen = sessionsLastSeenAlive.get(sessionID);
    return lastSeen !== undefined && Date.now() - lastSeen < LIVENESS_FRESHNESS_MS;
}

function bytesToMB(bytes: number | null | undefined): number | null {
    return bytes && bytes > 0 ? Math.round(bytes / BYTES_PER_MB) : null;
}

async function takeSample(): Promise<HeapSample> {
    // Reuse the shared memory reader so the performance.memory access lives in one place (getMemoryInfo)
    const memoryInfo = await getMemoryInfo();
    return {
        timestamp: Date.now(),
        usedJSHeapSizeMB: memoryInfo.usedMemoryMB,
        totalJSHeapSizeMB: bytesToMB(memoryInfo.totalMemoryBytes),
        jsHeapSizeLimitMB: bytesToMB(memoryInfo.maxMemoryBytes),
        domNodes: document.getElementsByTagName('*').length,
        route: getActiveRouteSafe(),
        reportsCount,
        visibility: document.visibilityState,
    };
}

function heartbeat() {
    takeSample()
        .then((sample) => {
            // The session can be torn down by cleanup while takeSample is awaiting
            if (!sessionRecord) {
                return;
            }
            sessionRecord.samples.push(sample);
            if (sessionRecord.samples.length > MAX_SAMPLES) {
                sessionRecord.samples.splice(0, sessionRecord.samples.length - MAX_SAMPLES);
            }
            sessionRecord.lastHeartbeat = Date.now();
            sessionRecord.cleanExit = false;
            persistSessionRecord();
            announceLiveness();
            reapDeadSessions();
        })
        .catch(() => {
            // Diagnostics must never break the app
        });
}

function reportAbnormalExit(record: SessionRecord) {
    const lastSample = record.samples.at(-1);
    Sentry.captureEvent({
        message: 'Crash diagnostics: previous browser session ended abnormally (possible tab crash)',
        level: 'warning',
        tags: {
            crashDiagnostics: 'abnormal_exit',
            lastRoute: lastSample?.route ?? 'unknown',
        },
        extra: {
            sessionID: record.id,
            sessionStartedAt: new Date(record.startedAt).toISOString(),
            lastHeartbeatAt: new Date(record.lastHeartbeat).toISOString(),
            sessionDurationMinutes: Math.round((record.lastHeartbeat - record.startedAt) / MS_PER_MINUTE),
            lastUsedJSHeapSizeMB: lastSample?.usedJSHeapSizeMB,
            lastTotalJSHeapSizeMB: lastSample?.totalJSHeapSizeMB,
            jsHeapSizeLimitMB: lastSample?.jsHeapSizeLimitMB,
            lastDOMNodes: lastSample?.domNodes,
            samples: record.samples,
        },
    });
}

/**
 * Removes finished session records and confirms-then-reports sessions that stopped sending heartbeats
 * without a clean exit. Runs on startup and on every heartbeat, so a surviving tab can also report a
 * crashed one.
 */
function reapDeadSessions() {
    let storageKeys: string[];
    try {
        storageKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(STORAGE_KEY_PREFIX));
    } catch {
        return;
    }

    for (const storageKey of storageKeys) {
        if (sessionRecord && storageKey === `${STORAGE_KEY_PREFIX}${sessionRecord.id}`) {
            continue;
        }
        const record = readSessionRecord(storageKey);
        if (!record || record.cleanExit) {
            window.localStorage.removeItem(storageKey);
            continue;
        }
        // Heartbeat is stale, but that alone cannot tell a crash apart from a suspended-but-alive tab.
        // Confirm the session is really gone before reporting it as a crash.
        if (Date.now() - record.lastHeartbeat > STALE_HEARTBEAT_MS) {
            confirmDeadThenReport(storageKey, record.id);
        }
    }
}

/**
 * A stale heartbeat is ambiguous: the owner may have crashed, or may just be suspended (laptop sleep,
 * paused background timers without a `freeze` event). Ask any owner to prove liveness, then re-check after
 * a grace period and only report if it stayed silent and never refreshed its record. This is what stops a
 * suspended live tab from being misreported as a crash.
 */
function confirmDeadThenReport(storageKey: string, sessionID: string) {
    if (pendingDeadChecks.has(sessionID)) {
        return;
    }
    requestLiveness();
    const timeoutID = setTimeout(() => {
        pendingDeadChecks.delete(sessionID);
        const record = readSessionRecord(storageKey);
        if (!record) {
            // Already reaped by another tab or cleared
            return;
        }
        if (record.cleanExit) {
            window.localStorage.removeItem(storageKey);
            return;
        }
        // Owner came back within the grace period — announced liveness or refreshed its heartbeat — so it
        // was suspended, not crashed.
        if (isSessionRecentlyAlive(sessionID) || Date.now() - record.lastHeartbeat <= STALE_HEARTBEAT_MS) {
            return;
        }
        reportAbnormalExit(record);
        window.localStorage.removeItem(storageKey);
    }, LIVENESS_GRACE_MS);
    pendingDeadChecks.set(sessionID, timeoutID);
}

function reportDiscardedTab() {
    const wasDiscarded = (document as Document & {wasDiscarded?: boolean}).wasDiscarded;
    if (!wasDiscarded) {
        return;
    }
    Sentry.captureEvent({
        message: 'Crash diagnostics: tab was discarded by the browser to reclaim memory',
        level: 'warning',
        tags: {crashDiagnostics: 'tab_discarded'},
    });
}

function initializeCrashDiagnostics() {
    if (!isStorageAvailable() || sessionRecord) {
        return;
    }

    reportDiscardedTab();

    sessionRecord = {
        id: Str.guid(),
        startedAt: Date.now(),
        lastHeartbeat: Date.now(),
        cleanExit: false,
        samples: [],
    };

    // A cross-tab channel lets a live-but-suspended tab prove it is alive when another tab is about to
    // report it as crashed, and lets this tab answer the same question for its peers.
    if (isBroadcastChannelAvailable()) {
        livenessChannel = new BroadcastChannel(LIVENESS_CHANNEL_NAME);
        livenessChannel.addEventListener('message', handleLivenessMessage);
        announceLiveness();
    }

    reportsConnection = Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT,
        waitForCollectionCallback: true,
        callback: (value: OnyxCollection<Report>) => {
            reportsCount = value ? Object.keys(value).length : 0;
        },
    });

    // pagehide fires on navigation away, refresh, and tab close — all clean exits. It does NOT fire on a
    // renderer crash, which is exactly the signal we rely on. pageshow restores the session after a
    // back/forward-cache restore. freeze/resume cover background tabs whose timers are fully suspended,
    // so a frozen tab isn't misreported as crashed.
    window.addEventListener('pagehide', markCleanExit);
    window.addEventListener('pageshow', markActive);
    document.addEventListener('freeze', markCleanExit);
    document.addEventListener('resume', markActive);

    // Report any previous session that ended abnormally now that our own record and liveness channel exist
    reapDeadSessions();

    heartbeat();
    sampleIntervalID = setInterval(heartbeat, SAMPLE_INTERVAL_MS);
}

function cleanupCrashDiagnostics() {
    if (sampleIntervalID) {
        clearInterval(sampleIntervalID);
        sampleIntervalID = undefined;
    }
    for (const timeoutID of pendingDeadChecks.values()) {
        clearTimeout(timeoutID);
    }
    pendingDeadChecks.clear();
    sessionsLastSeenAlive.clear();
    if (livenessChannel) {
        livenessChannel.removeEventListener('message', handleLivenessMessage);
        livenessChannel.close();
        livenessChannel = undefined;
    }
    if (reportsConnection) {
        Onyx.disconnect(reportsConnection);
        reportsConnection = undefined;
    }
    if (typeof window !== 'undefined') {
        window.removeEventListener('pagehide', markCleanExit);
        window.removeEventListener('pageshow', markActive);
        document.removeEventListener('freeze', markCleanExit);
        document.removeEventListener('resume', markActive);
    }
    markCleanExit();
    sessionRecord = undefined;
}

export {initializeCrashDiagnostics, cleanupCrashDiagnostics};
