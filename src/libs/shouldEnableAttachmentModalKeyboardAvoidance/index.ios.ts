// Resizing the iOS pager for the keyboard can reset its selection during rotation.
// Only the PDF password form should move to make room for the keyboard.
function shouldEnableAttachmentModalKeyboardAvoidance(): boolean {
    return false;
}

export default shouldEnableAttachmentModalKeyboardAvoidance;
