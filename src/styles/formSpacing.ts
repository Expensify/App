/**
 * The vertical rhythm of every form. Elements inside a form never carry their own outer vertical margins: the layout
 * container they sit in spaces them with one of these gaps (see the `Form/Layout` components).
 */
const formSpacing = {
    /** Between the top-level blocks of a form: its header, its fields, its sections, links, notices and the submit button */
    blockGap: 24,

    /** Between two fields */
    fieldGap: 20,

    /** Between a form or section title, its description and the rest of its header */
    headerGap: 12,

    /** Between the parts of one field, such as a label above an input or a caption below it */
    groupGap: 8,

    /** The vertical padding of a push row, pulled into the surrounding gap so the gap is measured to the row's text */
    menuRowInset: 12,
} as const;

export default formSpacing;
