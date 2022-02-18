/**
* Set value and selection of uncontrolled TextInput element
*
* @param {Object} textInputElement
* @param {String} text
* @param {Object} selection: {start: number, end: number}
*/
function setTextAndSelection(textInputElement, text, selection) {
    textInputElement.setNativeProps({text, selection});

    // This line used to prevent cursor/selection coming back to previous selection set by line above.
    setTimeout(() => textInputElement.setNativeProps({selection: {start: undefined, end: undefined}}), 0);
}

export default {
    setTextAndSelection,
};
