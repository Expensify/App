type PolicyTag = {
    /** Name of a Tag */
    name: string;

    /** Flag that determines if a tag is active and able to be selected */
    enabled: boolean;

    /** "General Ledger code" that corresponds to this tag in an accounting system. Similar to an ID. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code': string;
};

export default PolicyTag;
