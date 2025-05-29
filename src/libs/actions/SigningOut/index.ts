/**
 * Resets the signing out content shown state in sessionStorage
 */
export default function resetSigningOutContentShown() {
    sessionStorage.removeItem('signingOutContentShown');
}
