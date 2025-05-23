/**
 * Resets the logging out content shown state in sessionStorage
 */
export default function resetLoggingOutContentShown() {
    sessionStorage.removeItem('loggingOutContentShown');
}