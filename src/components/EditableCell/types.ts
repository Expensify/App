/**
 * false, or a promise of false, keeps the inline editor open with the typed value.
 * Use that when the write waits on a confirm modal. Anything else closes the editor.
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
