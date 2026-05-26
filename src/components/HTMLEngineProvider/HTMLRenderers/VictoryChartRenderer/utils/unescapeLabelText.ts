/**
 * Normalizes label text from HTML attributes, converting escaped newlines to real line breaks.
 */
function unescapeLabelText(text: string): string {
    return text.replace(/\\n/g, '\n');
}

export default unescapeLabelText;
