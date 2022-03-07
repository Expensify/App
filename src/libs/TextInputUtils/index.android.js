/**
* Set value and selection of uncontrolled TextInput element
*
* @param {Object} textInputElement
* @param {String} text
* @param {Object} selection: {start: number, end: number}
*/
function setTextAndSelection(textInputElement, {text, selection}) {
    textInputElement.setNativeProps({text, selection});
}

export default {
    setTextAndSelection,
};
