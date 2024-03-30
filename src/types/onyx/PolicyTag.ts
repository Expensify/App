import type * as OnyxCommon from './OnyxCommon';

type PolicyTag = {
    /** Name of a Tag */
    name: string;

    /** Flag that determines if a tag is active and able to be selected */
    enabled: boolean;

    /** "General Ledger code" that corresponds to this tag in an accounting system. Similar to an ID. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code'?: string;

    /** A list of errors keyed by microtime */
    errors?: OnyxCommon.Errors | null;
};

type PolicyTags = Record<string, OnyxCommon.OnyxValueWithOfflineFeedback<PolicyTag>>;

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
    }>
>;

export type {PolicyTag, PolicyTags, PolicyTagList};
