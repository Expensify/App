import type * as OnyxCommon from './OnyxCommon';

type PolicyTag = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of a Tag */
    name: string;

    /** Flag that determines if a tag is active and able to be selected */
    enabled: boolean;

    /** The old tag name of the tag when we edit the tag name */
    previousTagName?: string;

    /** "General Ledger code" that corresponds to this tag in an accounting system. Similar to an ID. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code'?: string;

    /** A list of errors keyed by microtime */
    errors?: OnyxCommon.Errors | null;
}>;

type PolicyTags = Record<string, PolicyTag>;

type PolicyTagList<T extends string = string> = Record<
    T,
    OnyxCommon.OnyxValueWithOfflineFeedback<{
        /** Name of the tag list */
        name: T;

        /** Flag that determines if tags are required */
        required: boolean;

        /** List of tags */
        tags: PolicyTags;

        /** Index by which the tag appears in the hierarchy of tags */
        orderWeight: number;

        /** A list of errors keyed by microtime */
        errors?: OnyxCommon.Errors;

        /** Error objects keyed by field name containing errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;
    }>
>;

export type {PolicyTag, PolicyTags, PolicyTagList};
