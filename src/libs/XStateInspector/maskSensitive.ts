import type {StatelyInspectionEvent} from '@statelyai/inspect';

const SENSITIVE_VALUE_MASK = '***';
const CIRCULAR_MARKER = '[Circular]';
const MAX_DEPTH_MARKER = '[MaxDepth]';

/** Depth cap of the inspector's default serializer, so oversized structures stay bounded. */
const MAX_DEPTH = 10;

/** Keys whose entire subtree is masked at any depth. Extend when machines start carrying a new kind of secret. */
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
    return typeof value === 'object' && value !== null && 'toJSON' in value && typeof value.toJSON === 'function';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Serializes a value to postMessage-safe data like the inspector's default serializer (honor `toJSON`,
 * drop functions and symbols, collapse cycles, cap depth). When `maskSensitiveKeys` is set, every
 * primitive under a {@link SENSITIVE_KEYS} key becomes {@link SENSITIVE_VALUE_MASK}; the shape is kept
 * so the inspector still shows which fields exist, never their values.
 */
function serialize(value: unknown, maskSensitiveKeys: boolean): unknown {
    // `visited` holds only the current recursion path (cleared on the way back up), so shared
    // non-circular references still render in full and only true cycles collapse to the marker.
    const visited = new WeakSet<WeakKey>();

    function walk(node: unknown, depth: number, isSensitive: boolean): unknown {
        if (typeof node === 'function' || typeof node === 'symbol' || node === undefined) {
            return undefined;
        }
        if (node === null || typeof node !== 'object') {
            return isSensitive ? SENSITIVE_VALUE_MASK : node;
        }
        if (visited.has(node)) {
            return CIRCULAR_MARKER;
        }
        if (depth >= MAX_DEPTH) {
            return MAX_DEPTH_MARKER;
        }

        visited.add(node);
        let result: unknown;
        if (hasToJSON(node)) {
            // Unwrapping `toJSON` keeps the same depth (like JSON.stringify), letting XState snapshots
            // shed unserializable internals such as `machine` and `_nodes`.
            result = walk(node.toJSON(), depth, isSensitive);
        } else if (Array.isArray(node)) {
            result = node.map((item) => walk(item, depth + 1, isSensitive) ?? null);
        } else {
            const masked: Record<string, unknown> = {};
            for (const [key, nested] of Object.entries(node)) {
                const maskedValue = walk(nested, depth + 1, isSensitive || (maskSensitiveKeys && SENSITIVE_KEYS.has(key)));
                if (maskedValue !== undefined) {
                    masked[key] = maskedValue;
                }
            }
            result = masked;
        }
        visited.delete(node);

        return result;
    }

    return walk(value, 0, false);
}

/** Serializes a value and masks every primitive under a sensitive key. */
function maskEvent(value: unknown): unknown {
    return serialize(value, true);
}

/** Serializes the machine state value without key masking - it is built only from static state-node names, never runtime data. */
function serializeStateValue(value: unknown): unknown {
    return serialize(value, false);
}

/**
 * The inspector's `serialize` option: masks the whole event before it reaches the stately.ai window.
 * The overloads keep the option's declared type while still accepting the looser raw snapshots the
 * inspector actually feeds in.
 *
 * `snapshot.value` is re-serialized without masking so a state named like a sensitive key
 * (`validateCode`, `pin`) stays readable; the exemption is scoped to that one path.
 */
function maskInspectionEvent(event: StatelyInspectionEvent): StatelyInspectionEvent;
function maskInspectionEvent(event: unknown): unknown;
function maskInspectionEvent(event: unknown): unknown {
    const masked = maskEvent(event);
    if (isRecord(event) && isRecord(masked) && isRecord(event.snapshot) && isRecord(masked.snapshot) && 'value' in event.snapshot) {
        masked.snapshot.value = serializeStateValue(event.snapshot.value);
    }
    return masked;
}

export {maskInspectionEvent, CIRCULAR_MARKER, MAX_DEPTH_MARKER, SENSITIVE_VALUE_MASK};
