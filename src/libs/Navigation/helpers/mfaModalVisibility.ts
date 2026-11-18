// Module-level so `EscapeHandler` can read it without subscribing to the flow-internal MFA context, which only the flow's own screens use.
let isMfaModalVisible = false;

/** Whether the MFA modal is on screen, from opening until its close animation ends. */
function getIsMfaModalVisible(): boolean {
    return isMfaModalVisible;
}

function setIsMfaModalVisible(isVisible: boolean): void {
    isMfaModalVisible = isVisible;
}

export {getIsMfaModalVisible, setIsMfaModalVisible};
