/**
 * Browser crash diagnostics (web only).
 *
 * A tab crash ("Aw, Snap!", typically an out-of-memory kill) terminates JS instantly, so nothing can be
 * reported at crash time. Instead, every session continuously persists a heartbeat plus a ring buffer of
 * memory/DOM samples to localStorage. On the next app start (or from another live tab), sessions that
 * stopped heartbeating without a clean exit are reported to Sentry together with their final samples,
 * showing what the user was doing and what was growing right before the tab died.
 *
 * localStorage is used instead of Onyx on purpose: the clean-exit marker must be written synchronously
 * during pagehide, and the records must survive Onyx.clear() on sign-out.
 */
import * as Sentry from '@sentry/react-native';
import {Str} from 'expensify-common';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

const STORAGE_KEY_PREFIX = 'crashDiagnostics_session_';
const SAMPLE_INTERVAL_MS = 15 * 1000;

// ~15 minutes of history at one sample per 15 seconds
const MAX_SAMPLES = 60;

// Background tabs throttle timers to roughly one run per minute, so a live but hidden tab can be silent
// for a while. Only sessions silent for longer than this are considered dead.
const STALE_HEARTBEAT_MS = 5 * 60 * 1000;

const BYTES_PER_MB = 1024 * 1024;

type HeapSample = {
    /** Epoch ms */
    t: number;
    usedJSHeapSizeMB: number | null;
    totalJSHeapSizeMB: number | null;
    jsHeapSizeLimitMB: number | null;
    domNodes: number;
    route: string;
    reportsCount: number | null;
    visibility: DocumentVisibilityState;
};

type SessionRecord = {
    id: string;
    startedAt: number;
    lastHeartbeat: number;
    /** True while the page is in a state where missing heartbeats are expected (pagehide/freeze) */
    cleanExit: boolean;
    samples: HeapSample[];
};

type PerformanceWithMemory = Performance & {
    memory?: {
        usedJSHeapSize?: number;
        totalJSHeapSize?: number;
        jsHeapSizeLimit?: number;
    };
};

let sessionRecord: SessionRecord | undefined;
let sampleIntervalID: ReturnType<typeof setInterval> | undefined;
let reportsCount: number | null = null;
let reportsConnection: ReturnType<typeof Onyx.connectWithoutView> | undefined;

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

function bytesToMB(bytes: number | undefined): number | null {
    return bytes && bytes > 0 ? Math.round(bytes / BYTES_PER_MB) : null;
}

function takeSample(): HeapSample {
    const perfMemory = (window.performance as PerformanceWithMemory | undefined)?.memory;
    return {
        t: Date.now(),
        usedJSHeapSizeMB: bytesToMB(perfMemory?.usedJSHeapSize),
        totalJSHeapSizeMB: bytesToMB(perfMemory?.totalJSHeapSize),
        jsHeapSizeLimitMB: bytesToMB(perfMemory?.jsHeapSizeLimit),
        domNodes: document.getElementsByTagName('*').length,
        route: getActiveRouteSafe(),
        reportsCount,
        visibility: document.visibilityState,
    };
}

function heartbeat() {
    if (!sessionRecord) {
        return;
    }
    sessionRecord.samples.push(takeSample());
    if (sessionRecord.samples.length > MAX_SAMPLES) {
        sessionRecord.samples.splice(0, sessionRecord.samples.length - MAX_SAMPLES);
    }
    sessionRecord.lastHeartbeat = Date.now();
    sessionRecord.cleanExit = false;
    persistSessionRecord();
    reapDeadSessions();
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
            sessionDurationMinutes: Math.round((record.lastHeartbeat - record.startedAt) / 60000),
            lastUsedJSHeapSizeMB: lastSample?.usedJSHeapSizeMB,
            lastTotalJSHeapSizeMB: lastSample?.totalJSHeapSizeMB,
            jsHeapSizeLimitMB: lastSample?.jsHeapSizeLimitMB,
            lastDOMNodes: lastSample?.domNodes,
            samples: record.samples,
        },
    });
}

/**
 * Removes finished session records and reports sessions that stopped heartbeating without a clean exit.
 * Runs on startup and on every heartbeat, so a surviving tab can also report a crashed one.
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
        // Not cleanly exited — could be another live tab, so only report once the heartbeat is stale
        if (Date.now() - record.lastHeartbeat > STALE_HEARTBEAT_MS) {
            reportAbnormalExit(record);
            window.localStorage.removeItem(storageKey);
        }
    }
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
    reapDeadSessions();

    sessionRecord = {
        id: Str.guid(),
        startedAt: Date.now(),
        lastHeartbeat: Date.now(),
        cleanExit: false,
        samples: [],
    };

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

    heartbeat();
    sampleIntervalID = setInterval(heartbeat, SAMPLE_INTERVAL_MS);
}

function cleanupCrashDiagnostics() {
    if (sampleIntervalID) {
        clearInterval(sampleIntervalID);
        sampleIntervalID = undefined;
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
