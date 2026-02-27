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
    onSave?: (value: T) => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {EditableProps};
