/**
 * @typedef AddEmojiToComposerTextInputReturnType
 * @property {String} newText The new text with the emoji added
 * @property {{start: Number, end: Number}} newSelection The new selection after the emoji was added
 */

/**
 * @typedef AddEmojiToComposerTextInputParams
 * @property {String} text The text where the emoji should be added
 * @property {String} emoji The emoji to add
 * @property {Object} textInput
 * @property {{start: Number, end: Number}} selection
 */

/**
 * Takes a text and adds an emoji at the place of selection.
 * It will then update the text of the given TextInput using its `setTextAndSelection` method.
 * `setTextAndSelection` method is usually available on TextInput refs from the composer component.
 *
 * Note: This is a separate method as for some platforms the update of the TextInput has to be
 * handled differently, and the method is used in several places.
 *
 * @param {AddEmojiToComposerTextInputParams} params
 * @return {AddEmojiToComposerTextInputReturnType}
 */
const addEmojiToComposerTextInput = ({
    text,
    emoji,
    textInput,
    selection,
}) => {
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
};
export default addEmojiToComposerTextInput;
