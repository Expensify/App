/** iOS already presents this navigator in its own window above the overlay. Moving the screen into the portal host leaves an empty opaque window. */
function shouldLiftTestToolsAboveRequire2FA(
    // The flag is part of the shared signature. iOS never lifts, so the value is unused.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isRequire2FAOverlayVisible: boolean,
): boolean {
    return false;
}

export default shouldLiftTestToolsAboveRequire2FA;
