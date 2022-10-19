/**
 * Takes a text and adds an emoji at the place of selection.
 * It will then update the text of the given TextInput using its `setTextAndSelection` method.
 * `setTextAndSelection` method is usually available on TextInput refs from the composer component.
 *
 * Note: This is a separate method as for some platforms the update of the TextInput has to be
 * handled differently, and the method is used in several places.
 *
 * @param {Object} params
 * @param {String} params.text The text where the emoji should be added
 * @param {String} params.emoji The emoji to add
 * @param {Object} params.textInput
 * @param {{start: Number, end: Number}} params.selection
 *
 * @return {{ newSelection: {start: Number, end: Number}, newText: String }} results
 */
function addEmojiToComposerTextInput({
    text,
    emoji,
    textInput,
    selection,
}) {
    const newText = text.slice(0, selection.start) + emoji + text.slice(selection.end, text.length);
    const newSelectionStart = selection.start + emoji.length;
    const newSelection = {
        start: newSelectionStart,
        end: newSelectionStart,
    };

    textInput.setTextAndSelection(newText, newSelection.start, newSelection.end);

    return {
        newText,
        newSelection,
    };
}

export default addEmojiToComposerTextInput;
