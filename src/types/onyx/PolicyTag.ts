import type * as OnyxCommon from './OnyxCommon';

/** Model of policy tag */
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

    /** The rules applied to the policy tag */
    rules?: {
        /**
         * String representation of regex to match against parent tag. Eg, if San Francisco is a child tag of California
         * its parentTagsFilter will be ^California$
         */
        parentTagsFilter?: string;
    };

    /**
     * String representation of regex to match against parent tag. Eg, if San Francisco is a child tag of California
     * its parentTagsFilter will be ^California$
     */
    parentTagsFilter?: string;
}>;

/** Record of policy tags, indexed by their name */
type PolicyTags = Record<string, PolicyTag>;

/** Single policy tag list */
type PolicyTagList = {
    /** Name of the tag list */
    name: string;

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
};

/** Record of policy tag lists, index by the name of the tag list */
type PolicyTagLists = Record<string, OnyxCommon.OnyxValueWithOfflineFeedback<PolicyTagList>>;

export type {PolicyTag, PolicyTags, PolicyTagLists};
