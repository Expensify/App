// Only browsers can show the Turnstile check, so challenged requests on native fail before this modal could open.
// Keeping the no-op component lets shared code import CloudflareChallengeModal on every platform.
function CloudflareChallengeModal() {
    return null;
}

export default CloudflareChallengeModal;
