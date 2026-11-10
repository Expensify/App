/** Web and Android paint this navigator under the required-2FA overlay, so the focused screen moves into the portal host above it. */
function shouldLiftTestToolsAboveRequire2FA(isRequire2FAOverlayVisible: boolean): boolean {
    return isRequire2FAOverlayVisible;
}

export default shouldLiftTestToolsAboveRequire2FA;
