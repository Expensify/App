import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

import type {StatelyInspectionEvent} from '@statelyai/inspect';

import {isMachineSnapshot} from 'xstate';

const SENSITIVE_VALUE_MASK = '***';
const CIRCULAR_MARKER = '[Circular]';
const MAX_DEPTH_MARKER = '[MaxDepth]';

/** This depth cap matches the inspector's default serializer and keeps oversized structures bounded. */
const MAX_DEPTH = 10;

/**
 * Keys whose entire subtree is masked at any depth. The shared auth-key set keeps credentials
 * redacted consistently with logs and parameter errors. `payload` is inspector-only because MFA
 * scenario payloads can contain arbitrary PII, while globally treating every application payload as
 * sensitive would hide unrelated diagnostics.
 */
const SENSITIVE_KEYS = new Set<string>([...CONST.SENSITIVE_AUTH_KEYS, 'payload']);

/**
 * The inspector can run its serializer repeatedly on the result of an earlier pass. Remembering our
 * own plain-object outputs makes masking idempotent without putting a marker into postMessage data.
 */
const MASKED_INSPECTION_EVENTS = new WeakSet<WeakKey>();

function hasToJSON(value: unknown): value is {toJSON: () => unknown} {
    return typeof value === 'object' && value !== null && 'toJSON' in value && typeof value.toJSON === 'function';
}

/**
 * Serializes a value into postMessage-safe data, much like the inspector's default serializer. It
 * honors `toJSON`, drops functions and symbols, collapses cycles, and caps the depth. When
 * `maskSensitiveKeys` is set, every primitive under a {@link SENSITIVE_KEYS} key becomes
 * {@link SENSITIVE_VALUE_MASK}.
 */
function serialize(value: unknown, maskSensitiveKeys: boolean): unknown {
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

/**
 * The inspector's `serialize` option. Sensitive runtime values are masked before they reach the
 * stately.ai window, while `snapshot.value` is serialized without masking because it contains only
 * static state-node names. Masking that path can turn a valid state name into
 * {@link SENSITIVE_VALUE_MASK}, preventing the inspector from resolving the machine snapshot.
 *
 * That exemption is limited to real machine snapshots, via xstate's own `isMachineSnapshot`. Any other
 * actor logic is free to keep runtime data under its snapshot's `value`, which must stay masked.
 *
 * The overloads keep the option's declared type while still accepting the looser raw snapshots that
 * the inspector actually passes in.
 */
function maskInspectionEvent(event: StatelyInspectionEvent): StatelyInspectionEvent;
function maskInspectionEvent(event: unknown): unknown;
function maskInspectionEvent(event: unknown): unknown {
    if (isRecord(event) && MASKED_INSPECTION_EVENTS.has(event)) {
        return event;
    }

    const masked = serialize(event, true);
    if (isRecord(event) && isRecord(masked) && isRecord(masked.snapshot) && isMachineSnapshot(event.snapshot)) {
        masked.snapshot.value = serialize(event.snapshot.value, false);
    }
    if (isRecord(masked)) {
        MASKED_INSPECTION_EVENTS.add(masked);
    }
    return masked;
}

export {maskInspectionEvent, CIRCULAR_MARKER, MAX_DEPTH_MARKER, SENSITIVE_VALUE_MASK};
