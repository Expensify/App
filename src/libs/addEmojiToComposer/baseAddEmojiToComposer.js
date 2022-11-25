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
 * @param {Object} params.selection
 * @param {Number} params.selection.start
 * @param {Number} params.selection.end
 *
 * @return {Object} results
 */
function baseAddEmojiToComposer({
    text,
    emoji,
    textInput,
    selection,
}) {
    const emojiWithSpace = `${emoji} `;
    const newText = text.slice(0, selection.start) + emojiWithSpace + text.slice(selection.end, text.length);
    const newSelectionStart = selection.start + emojiWithSpace.length;
    const newSelection = {
        start: newSelectionStart,
        end: newSelectionStart,
    };

    textInput.setText(newText);

    return {
        newText,
        newSelection,
    };
}

export default baseAddEmojiToComposer;
