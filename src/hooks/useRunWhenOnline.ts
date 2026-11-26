/**
 * Runs an action that needs a connection, such as opening a form that saves each page to the server, or shows the "You appear to be offline" modal instead
 */
import useAlertModals from './useAlertModals';
import useNetwork from './useNetwork';

function useRunWhenOnline() {
    const {isOffline} = useNetwork();
    const {showOfflineModal} = useAlertModals();

    const runWhenOnline = (action: () => void) => {
        if (isOffline) {
            showOfflineModal();
            return;
        }
        action();
    };

    return runWhenOnline;
}

export default useRunWhenOnline;
