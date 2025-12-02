/** Clears text that user selected by double-clicking -
 * it's not tied to virtual DOM, so sometimes it has to be cleared manually */
function clearSelectedText() {
    window.getSelection()?.removeAllRanges();
}

export default clearSelectedText;
