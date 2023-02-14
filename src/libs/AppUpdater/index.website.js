import pkg from "../../../package.json";
import Visibility from "../Visibility";

/**
 * Download the latest app version from the server, and if it is different than the current one,
 * then refresh. If the page is visibile, prompt the user to refresh.
 */
function update() {
    fetch('/version.json', {cache: 'no-cache'})
        .then(response => response.json())
        .then(({version}) => {
            if (version === pkg.version) {
                return;
            }

            if (!Visibility.isVisible()) {
                // Page is hidden, refresh immediately
                window.location.reload(true);
                return;
            }

            // Prompt user to refresh the page
            if (window.confirm('Refresh the page to get the latest updates!')) {
                window.location.reload(true);
            }
        });
}

export default {
    init: () => {
        // We want to check for updates and refresh the page if necessary when the app is backgrounded.
        // That way, it will auto-update silently when they minimize the page,
        // and we don't bug the user any more than necessary :)
        window.addEventListener('visibilitychange', () => {
            if (Visibility.isVisible()) {
                return;
            }

            update();
        });
    },
    update,
};
