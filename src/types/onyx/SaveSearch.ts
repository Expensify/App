/**
 * Model of saved search
 */
type SaveSearch = Record<
    string,
    {
        /** Name of the saved search */
        name: string;

        /** Query string for the saved search */
        query: string;
    }
>;

export default SaveSearch;
