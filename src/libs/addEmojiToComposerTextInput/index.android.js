import addEmojiToComposerTextInputImpl from './addEmojiToComposerTextInput';

/**
 * Takes a text and adds an emoji at the place of selection.
 * It will then update the text of the given TextInput using its `setTextAndSelection` method.
 * `setTextAndSelection` method is usually available on TextInput refs from the composer component.
 *
 * @param {Object} params
 * @param {String} params.text The text where the emoji should be added
 * @param {String} params.emoji The emoji to add
 * @param {Object} params.textInput
 * @param {{start: Number, end: Number}} params.selection
 *
 * @return {{ newSelection: {start: Number, end: Number}, newText: String }} results
 */
function addEmojiToComposerTextInput(params) {
    const {prevSelection, textInput} = params;
    const hasRangeSelected = prevSelection.start !== prevSelection.end;
    if (hasRangeSelected) {
        // Android: when we have a range selected setSelection
        // won't remove the highlight, so we manually set the cursor
        // to a selection range of 0 (so there won't be any selection highlight).
        textInput.setSelection(prevSelection.start, prevSelection.start);
    }

    return addEmojiToComposerTextInputImpl(params);
}

export default addEmojiToComposerTextInput;
