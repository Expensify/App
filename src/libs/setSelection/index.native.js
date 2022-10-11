export default function setSelection(textInput, start, end) {
    if (!textInput) {
        return;
    }

    textInput.setSelection(start, end);
}
