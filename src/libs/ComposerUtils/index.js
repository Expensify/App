import getNumberOfLines from './getNumberOfLines';
import updateNumberOfLines from './updateNumberOfLines';

/**
 * Replace substring between selection with a text.
 * @param {String} text
 * @param {Object} selection
 * @param {String} textToInsert
 * @returns {String}
 */
function insertText(text, selection, textToInsert) {
    return text.slice(0, selection.start) + textToInsert + text.slice(selection.end, text.length);
}

export {
    getNumberOfLines,
    updateNumberOfLines,
    insertText,
};
