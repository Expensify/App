type PolicyCategory = {
    /** Name of a category */
    name: string;

    /** Flag that determines if a category is active and able to be selected */
    enabled: boolean;

    areCommentsRequired: boolean;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code': string;

    externalID: string;

    origin: string;
};

export default PolicyCategory;
