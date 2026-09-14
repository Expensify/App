/** Model of the saved view that is currently being edited through the "Edit filters" flow */
type EditingSavedSearch = {
    /** ID of the saved view being edited (its key in SAVED_SEARCHES) */
    id: string;

    /** Display name of the saved view being edited */
    name: string;

    /** The saved view's original query string, used to re-execute it when edits are cancelled */
    query: string;
};

export default EditingSavedSearch;
