/**
* Set value and selection of uncontrolled TextInput element
*
* @param {Object} textInputElement
* @param {String} text
* @param {Object} selection: {start: number, end: number}
*/
function setTextAndSelection(textInputElement, text, selection) {
    const el = textInputElement;
    el.value = text;
    textInputElement.setSelectionRange(selection.start, selection.end);
}

export default {
    setTextAndSelection,
};
