/**
 * Shared props for all inline-editable table cells.
 *
 * @template T  The type of the value being saved (e.g. `string`, `number`).
 */
type EditableProps<T> = {
    /**
     * Architectural flag: true only on wide/desktop layouts where inline editing is
     * supported. When false the cell renders bare children with no wrapper.
     * Use this only for permanent, layout-driven decisions.
     */
    isEditable?: boolean;

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
