import type {StatelyInspectionEvent} from '@statelyai/inspect';
import CONST from '@src/CONST';

const SENSITIVE_VALUE_MASK = '***';
const CIRCULAR_MARKER = '[Circular]';
const MAX_DEPTH_MARKER = '[MaxDepth]';

/** This depth cap matches the inspector's default serializer and keeps oversized structures bounded. */
const MAX_DEPTH = 10;

/**
 * Keys whose entire subtree is masked at any depth. This is the same shared set
 * ({@link CONST.SENSITIVE_AUTH_KEYS}) that the log and parameter-error redactors use, so that secrets
 * are redacted identically wherever data leaves the app.
 */
const SENSITIVE_KEYS = new Set<string>(CONST.SENSITIVE_AUTH_KEYS);

function hasToJSON(value: unknown): value is {toJSON: () => unknown} {
    return typeof value === 'object' && value !== null && 'toJSON' in value && typeof value.toJSON === 'function';
}

/**
 * The inspector's `serialize` option, which masks the whole event before it reaches the stately.ai
 * window. It serializes the event into postMessage-safe data, much like the inspector's default
 * serializer: it honors `toJSON`, drops functions and symbols, collapses cycles, and caps the depth.
 * Every primitive under a {@link SENSITIVE_KEYS} key becomes {@link SENSITIVE_VALUE_MASK}, while the
 * surrounding shape is preserved, so the inspector still shows which fields exist without revealing
 * their values.
 *
 * The overloads keep the option's declared type while still accepting the looser raw snapshots that
 * the inspector actually passes in.
 */
function maskInspectionEvent(event: StatelyInspectionEvent): StatelyInspectionEvent;
function maskInspectionEvent(event: unknown): unknown;
function maskInspectionEvent(event: unknown): unknown {
    // `visited` holds only the nodes on the current path, because each one is removed again as the
    // walk returns. A value that is shared but not circular therefore still renders in full, and only
    // a true cycle collapses to the marker.
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
            // Calling `toJSON` does not increase the depth, exactly as `JSON.stringify` behaves, which
            // lets XState snapshots drop internal fields that cannot be serialized, such as `machine`
            // and `_nodes`.
            result = walk(node.toJSON(), depth, isSensitive);
        } else if (Array.isArray(node)) {
            result = node.map((item) => walk(item, depth + 1, isSensitive) ?? null);
        } else {
            const masked: Record<string, unknown> = {};
            for (const [key, nested] of Object.entries(node)) {
                const maskedValue = walk(nested, depth + 1, isSensitive || SENSITIVE_KEYS.has(key));
                if (maskedValue !== undefined) {
                    masked[key] = maskedValue;
                }
            }
            result = masked;
        }
        visited.delete(node);

        return result;
    }

    return walk(event, 0, false);
}

export {maskInspectionEvent, CIRCULAR_MARKER, MAX_DEPTH_MARKER, SENSITIVE_VALUE_MASK};
