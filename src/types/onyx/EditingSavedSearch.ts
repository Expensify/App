/** Model of the saved view that is currently being edited through the "Edit filters" flow */
type EditingSavedSearch = {
    /** Hash of the saved view being edited (its identity key in SAVED_SEARCHES) */
    hash: number;

    /** Display name of the saved view being edited */
    name: string;

    /** The saved view's original query string, used to re-execute it when edits are cancelled */
    query: string;

    /** Monotonic id bumped on every "Edit filters" click so the filters popover re-opens for each request, even when it targets the saved view that was just edited and closed */
    requestID: number;
};

export default EditingSavedSearch;
