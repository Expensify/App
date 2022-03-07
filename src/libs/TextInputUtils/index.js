/**
* Set value and selection of uncontrolled TextInput element
*
* @param {Object} textInputElement
* @param {String} text
* @param {Object} selection: {start: number, end: number}
*/
function setTextAndSelection(textInputElement, {text, selection}, {shouldUpdateRowHeight = false, maxLines} = {}) {
    const el = textInputElement;
    const updatedProps = {text};
    if (shouldUpdateRowHeight) {
        updatedProps.rows = Math.min((text.match(/\n/g) || '').length + 1, maxLines);
    }
    el.setNativeProps(updatedProps);
    el.setSelectionRange(selection.start, selection.end);
}

export default {
    setTextAndSelection,
};
