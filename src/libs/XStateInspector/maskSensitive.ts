import type {StatelyInspectionEvent} from '@statelyai/inspect';

const SENSITIVE_VALUE_MASK = '***';
const CIRCULAR_MARKER = '[Circular]';
const MAX_DEPTH_MARKER = '[MaxDepth]';

/** Matches the depth cap of the inspector's default serializer so oversized structures stay bounded. */
const MAX_DEPTH = 10;

/** Keys whose entire subtree is masked (at any depth) before inspection events leave the app. Extend when machines start carrying a new kind of secret. */
const SENSITIVE_KEYS = new Set([
    'payload',
    'body',
    'pin',
    'pan',
    'cvv',
    'password',
    'token',
    'otp',
    'secret',
    'validateCode',
    'keyInfo',
    'challenge',
    'signedChallenge',
    'registrationChallenge',
    'authorizationChallenge',
]);

function hasToJSON(value: unknown): value is {toJSON: () => unknown} {
    if (typeof value !== 'object' || value === null || !('toJSON' in value)) {
        return false;
    }
    return typeof value.toJSON === 'function';
}

/**
 * Serializes a value to plain postMessage-safe data - honoring `toJSON`, dropping functions and
 * symbols, cutting cycles and capping depth like the inspector's default serializer - while
 * replacing every primitive leaf under a sensitive key with a mask. Keeping the shape lets the
 * inspector show which fields exist without ever seeing their values.
 *
 * `visited` tracks only the current recursion path (entries are removed on the way back up), so a
 * shared non-circular reference renders fully and only true cycles collapse to the marker.
 */
function maskDeep(value: unknown, isUnderSensitiveKey: boolean, depth: number, visited: WeakSet<WeakKey>, maskByKey: boolean): unknown {
    if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
        return undefined;
    }
    if (value === null || typeof value !== 'object') {
        return isUnderSensitiveKey ? SENSITIVE_VALUE_MASK : value;
    }
    if (visited.has(value)) {
        return CIRCULAR_MARKER;
    }
    if (depth >= MAX_DEPTH) {
        return MAX_DEPTH_MARKER;
    }

    visited.add(value);
    let result: unknown;
    if (hasToJSON(value)) {
        // Unwrapping does not descend, so the depth stays; XState snapshots rely on this to shed
        // their unserializable internals (`machine`, `_nodes`) exactly like JSON.stringify would.
        result = maskDeep(value.toJSON(), isUnderSensitiveKey, depth, visited, maskByKey);
    } else if (Array.isArray(value)) {
        result = value.map((item) => maskDeep(item, isUnderSensitiveKey, depth + 1, visited, maskByKey) ?? null);
    } else {
        const masked: Record<string, unknown> = {};
        for (const [key, nested] of Object.entries(value)) {
            const maskedValue = maskDeep(nested, isUnderSensitiveKey || (maskByKey && SENSITIVE_KEYS.has(key)), depth + 1, visited, maskByKey);
            if (maskedValue !== undefined) {
                masked[key] = maskedValue;
            }
        }
        result = masked;
    }
    visited.delete(value);

    return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The single outbound gate for inspection traffic, passed as the inspector's `serialize` option.
 * Unlike the `sanitizeContext`/`sanitizeEvent` hooks - which only ever see `snapshot.context` and
 * `event` - it runs on the complete event, so child-actor `input`/`output`/`error` and every other
 * field are masked before anything reaches the stately.ai window. Inspector-required metadata
 * (`type`, `_version`, session ids) uses non-sensitive keys and passes through untouched.
 *
 * Declared as overloads: the first matches the inspector's `serialize` option, the second admits
 * the arbitrary runtime values the implementation is total over (the inspector feeds it raw
 * snapshots whose actual shape is far looser than the option type claims).
 *
 * `snapshot.value` is exempt from key-based masking: it is the machine's current state value, built
 * only from static state-node names (never runtime data), and the inspector cannot highlight the
 * active state without it - so a state named like a sensitive key (`validateCode`, `pin`) stays
 * readable. The exemption is scoped to that one path; a `value` key anywhere else is still masked.
 */
function maskInspectionEvent(event: StatelyInspectionEvent): StatelyInspectionEvent;
function maskInspectionEvent(event: unknown): unknown;
function maskInspectionEvent(event: unknown): unknown {
    const masked = maskDeep(event, false, 0, new WeakSet(), true);
    if (!isRecord(event) || !isRecord(masked) || !isRecord(event.snapshot) || !isRecord(masked.snapshot) || !('value' in event.snapshot)) {
        return masked;
    }
    masked.snapshot.value = maskDeep(event.snapshot.value, false, 0, new WeakSet(), false);
    return masked;
}

export {maskInspectionEvent, CIRCULAR_MARKER, MAX_DEPTH_MARKER, SENSITIVE_VALUE_MASK};
