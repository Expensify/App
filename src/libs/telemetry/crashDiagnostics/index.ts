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

// Number of most-recent samples inspected to decide whether the session was in the foreground near the end.
const RECENT_SAMPLE_WINDOW = 4;

// Peak-heap-usage cutoffs (as a percentage of the hard limit) used to bucket heap pressure for Sentry tagging.
const HEAP_PRESSURE_HIGH_PCT = 80;
const HEAP_PRESSURE_MID_PCT = 50;

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

    /** True while missing heartbeats are expected: a real/clean exit (pagehide/freeze) or a backgrounded (hidden) tab. */
    cleanExit: boolean;

    /** Highest `usedJSHeapSizeMB` seen this session; survives ring-buffer eviction. Null on non-Chromium browsers. */
    peakUsedJSHeapSizeMB: number | null;

    /** Highest DOM-node count seen this session; survives ring-buffer eviction. */
    peakDomNodes: number;

    /**
     * Most recent known page visibility, updated immediately on `visibilitychange` (not only on the 15s
     * heartbeat). Used to tell a foreground crash from a backgrounded tab without lagging a full heartbeat
     * behind the real state. Optional for back-compat with records written before this field existed.
     */
    lastVisibility?: DocumentVisibilityState;

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

/**
 * Sync the exit state to current page visibility. While the tab is `hidden`, throttled or absent heartbeats are
 * expected: Chrome throttles/suspends background-tab timers, laptop sleep stops them with no `freeze` event, and
 * `freeze` never fires at all in Safari/Firefox — so a hidden tab is marked clean and will not be misreported as
 * a crash. A renderer crash the user actually experiences happens while the tab is `visible`.
 */
function syncExitStateWithVisibility() {
    if (typeof document === 'undefined' || !sessionRecord) {
        return;
    }
    // Record visibility the instant it changes so a tab foregrounded just before a crash is not mistaken for a
    // background tab by the next reap (the last heartbeat sample can be up to SAMPLE_INTERVAL_MS stale).
    sessionRecord.lastVisibility = document.visibilityState;
    markExitState(document.visibilityState === 'hidden');
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
            if (sample.usedJSHeapSizeMB !== null && sample.usedJSHeapSizeMB > (sessionRecord.peakUsedJSHeapSizeMB ?? 0)) {
                sessionRecord.peakUsedJSHeapSizeMB = sample.usedJSHeapSizeMB;
            }
            if (sample.domNodes > sessionRecord.peakDomNodes) {
                sessionRecord.peakDomNodes = sample.domNodes;
            }
            sessionRecord.lastHeartbeat = Date.now();
            // While hidden, missing/throttled heartbeats are expected, so keep the session marked clean; only a
            // tab that goes silent while visible is a crash candidate.
            sessionRecord.cleanExit = sample.visibility === 'hidden';
            sessionRecord.lastVisibility = sample.visibility;
            persistSessionRecord();
            announceLiveness();
            reapDeadSessions();
        })
        .catch(() => {
            // Diagnostics must never break the app
        });
}

/**
 * Buckets peak heap usage as a fraction of the hard limit, for indexed Sentry tagging. Returns `unknown` on
 * non-Chromium browsers (no `performance.memory`) so those events stay visible rather than being filtered out.
 * Reported from the session peak, not the last sample, because an OOM spike can occur between heartbeats.
 */
function getHeapPressureBucket(record: SessionRecord): string {
    const limitMB = record.samples.at(-1)?.jsHeapSizeLimitMB ?? null;
    if (record.peakUsedJSHeapSizeMB == null || limitMB == null || limitMB <= 0) {
        return 'unknown';
    }
    const pct = (record.peakUsedJSHeapSizeMB / limitMB) * 100;
    if (pct >= HEAP_PRESSURE_HIGH_PCT) {
        return 'high';
    }
    if (pct >= HEAP_PRESSURE_MID_PCT) {
        return 'mid';
    }
    return 'low';
}

/** Buckets session duration (minutes) for indexed Sentry tagging. */
function getSessionDurationBucket(minutes: number): string {
    if (minutes <= 5) {
        return '0-5';
    }
    if (minutes <= 30) {
        return '6-30';
    }
    if (minutes <= 120) {
        return '31-120';
    }
    if (minutes <= 480) {
        return '121-480';
    }
    return '480+';
}

function reportAbnormalExit(record: SessionRecord) {
    const lastSample = record.samples.at(-1);
    const durationMinutes = Math.round((record.lastHeartbeat - record.startedAt) / MS_PER_MINUTE);
    // A real renderer crash happens in the foreground; treat any visible sample in the recent window as
    // "was in use" so background-only sessions can be filtered out in Sentry. Also honor the live
    // `lastVisibility`, which can be `visible` while every sample is still `hidden` when the tab was
    // foregrounded and then crashed before the next heartbeat could record a visible sample.
    const wasForeground = record.lastVisibility === 'visible' || record.samples.slice(-RECENT_SAMPLE_WINDOW).some((sample) => sample.visibility === 'visible');
    Sentry.captureEvent({
        message: 'Crash diagnostics: previous browser session ended abnormally (possible tab crash)',
        level: 'warning',
        tags: {
            crashDiagnostics: 'abnormal_exit',
            lastRoute: lastSample?.route ?? 'unknown',
            lastVisibility: record.lastVisibility ?? lastSample?.visibility ?? 'unknown',
            wasForeground: String(wasForeground),
            heapPressure: getHeapPressureBucket(record),
            sessionDurationBucket: getSessionDurationBucket(durationMinutes),
            browserEngine: lastSample?.jsHeapSizeLimitMB ? 'chromium' : 'other',
        },
        extra: {
            sessionID: record.id,
            sessionStartedAt: new Date(record.startedAt).toISOString(),
            lastHeartbeatAt: new Date(record.lastHeartbeat).toISOString(),
            sessionDurationMinutes: durationMinutes,
            lastUsedJSHeapSizeMB: lastSample?.usedJSHeapSizeMB,
            lastTotalJSHeapSizeMB: lastSample?.totalJSHeapSizeMB,
            jsHeapSizeLimitMB: lastSample?.jsHeapSizeLimitMB,
            lastDOMNodes: lastSample?.domNodes,
            peakUsedJSHeapSizeMB: record.peakUsedJSHeapSizeMB ?? null,
            peakDOMNodes: record.peakDomNodes ?? null,
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
        if (!record) {
            window.localStorage.removeItem(storageKey);
            continue;
        }
        const isStale = Date.now() - record.lastHeartbeat > STALE_HEARTBEAT_MS;
        // A clean session (cleanly exited, or a currently-hidden background tab) is only safe to drop once it
        // has also gone stale. Removing a fresh clean record would delete a live, backgrounded tab's diagnostics.
        if (record.cleanExit) {
            if (isStale) {
                window.localStorage.removeItem(storageKey);
            }
            continue;
        }
        // Heartbeat is stale, but that alone cannot tell a crash apart from a suspended-but-alive tab.
        // Confirm the session is really gone before reporting it as a crash.
        if (isStale) {
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
        // Defense in depth: a session that was hidden when last seen is a backgrounded/suspended tab, not a
        // foreground crash. heartbeat() already keeps such sessions marked clean, but guard here too in case an
        // older record (written before visibility-aware exit state) slipped through. Prefer the immediately
        // updated `lastVisibility` over the last sample, which can lag the real state by up to one heartbeat: a
        // tab foregrounded and then crashed within that window has a stale `hidden` sample but was visible.
        const lastKnownVisibility = record.lastVisibility ?? record.samples.at(-1)?.visibility;
        if (lastKnownVisibility === 'hidden') {
            window.localStorage.removeItem(storageKey);
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
        peakUsedJSHeapSizeMB: null,
        peakDomNodes: 0,
        lastVisibility: typeof document !== 'undefined' ? document.visibilityState : undefined,
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
        callback: (value: OnyxCollection<Report>) => {
            reportsCount = value ? Object.keys(value).length : 0;
        },
    });

    // pagehide fires on navigation away, refresh, and tab close — all clean exits. It does NOT fire on a
    // renderer crash, which is exactly the signal we rely on. pageshow/resume restore the session after a
    // back/forward-cache restore or freeze. visibilitychange is the broad, cross-browser signal that the tab
    // was backgrounded: freeze only fires for the subset of background tabs Chrome actually suspends (and never
    // in Safari/Firefox), so relying on it alone misreported hidden-but-not-frozen tabs as crashes.
    window.addEventListener('pagehide', markCleanExit);
    window.addEventListener('pageshow', syncExitStateWithVisibility);
    document.addEventListener('freeze', markCleanExit);
    document.addEventListener('resume', syncExitStateWithVisibility);
    document.addEventListener('visibilitychange', syncExitStateWithVisibility);

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
        window.removeEventListener('pageshow', syncExitStateWithVisibility);
        document.removeEventListener('freeze', markCleanExit);
        document.removeEventListener('resume', syncExitStateWithVisibility);
        document.removeEventListener('visibilitychange', syncExitStateWithVisibility);
    }
    markCleanExit();
    sessionRecord = undefined;
}

export {initializeCrashDiagnostics, cleanupCrashDiagnostics};
