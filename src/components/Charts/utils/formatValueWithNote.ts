/** Formats a value followed by a note in parentheses */
function formatValueWithNote(value: string, note?: string): string {
    return note ? `${value} (${note})` : value;
}

export default formatValueWithNote;
