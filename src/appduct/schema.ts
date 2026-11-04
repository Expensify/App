/**
 * Shared helpers for Appduct tool registrations.
 */

/**
 * Pass a raw JSON Schema through to Appduct with the handler's argument and result types.
 *
 * The SDK's helper of the same name is only a cast, and `@appduct/shared` is an internal
 * dependency of `@appduct/web` published ESM-only, which App's jest cannot load. A raw schema is
 * published verbatim and never validated app-side, so the handler receives what the caller sent.
 */
function rawSchema<T>(schema: Record<string, unknown>): Record<string, unknown> & {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- the marker key the Appduct schema normalizer reads, spelled by its SDK
    readonly '~appductJsonSchemaTypes'?: {readonly input: T; readonly output: T};
} {
    return schema;
}

/** The input schema for a tool that takes no arguments. */
const emptyInputSchema = rawSchema<Record<string, never>>({type: 'object', properties: {}, additionalProperties: false});

export {rawSchema, emptyInputSchema};
