/**
* Set value and selection of uncontrolled TextInput element
*
* @param {Object} textInputElement
* @param {String} text
* @param {Object} selection: {start: number, end: number}
*/
function setTextAndSelection(textInputElement, {text, selection}) {
    textInputElement.setNativeProps({text});

    // In IOS setNativeProps({text}) (line above) will change selection of textInputElement. Add selection properties in parameter will result in unexpected behaviour.
    // To get the expected behaviour need to split setNativeProps for text and selection
    // Let previous setNativeProps finish first and then set selection properly
    setTimeout(() => textInputElement.setNativeProps({selection}), 0);
}

export default {
    setTextAndSelection,
};
