/**
 * A promise keeps the editor open until the confirm modal settles, so the typed value stays visible.
 * Once it settles, the editor closes. Resolving false means the user cancelled, and the draft is dropped.
 * A synchronous false keeps the editor open with the typed value.
 */
type InlineEditSaveResult = void | boolean | Promise<boolean>;

/**
 * Shared props for all inline-editable table cells.
 *
 * @template T  The type of the value being saved (e.g. `string`, `number`).
 */
type EditableProps<T> = {
    /**
     * Transient flag: false while editing is temporarily unavailable
     * (e.g. receipt scanning, insufficient permissions).
     * The styled container is still rendered to preserve column alignment.
     */
    canEdit?: boolean;

    /** Called with the new value when the user commits an edit. */
    onSave?: (value: T) => InlineEditSaveResult;
};

export type {EditableProps, InlineEditSaveResult};
