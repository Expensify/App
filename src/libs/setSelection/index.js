export default function setSelection(textInput, start, end) {
    if (!textInput) {
        return;
    }

    textInput.setSelectionRange(start, end);
}
