/**
* Set value and selection of uncontrolled TextInput element
*
* @param {Object} textInputElement
* @param {String} text
* @param {Object} selection: {start: number, end: number}
*/
function setTextAndSelection(textInputElement, {text, selection}) {
    // In IOS setNativeProps({text}) (line above) will change selection of textInputElement. Add selection properties in parameter will result in unexpected behaviour.
    // To get the expected behaviour need to split setNativeProps for text and selection
    // Let previous setNativeProps finish and then set selection properly
    new Promise(() => {
        textInputElement.setNativeProps({text});
    }).then(() => {
        // This line used to prevent cursor/selection coming back to previous selection set by line above.
        textInputElement.setNativeProps({selection});
    });
}

export default {
    setTextAndSelection,
};
