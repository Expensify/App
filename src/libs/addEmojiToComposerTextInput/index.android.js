import addEmojiToComposerTextInputImpl from './addEmojiToComposerTextInput';

/**
 * Takes a text and adds an emoji at the place of selection.
 * It will then update the text of the given TextInput using its `setTextAndSelection` method.
 * `setTextAndSelection` method is usually available on TextInput refs from the composer component.
 *
 * @param {AddEmojiToComposerTextInputParams} params
 * @return {AddEmojiToComposerTextInputReturnType}
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
