import {useEffect} from 'react';
import {confirmReadyToOpenApp} from '@libs/actions/App';

/**
 * Signals that the app is ready to be opened.
 *
 * This hook resolves the internal "isReadyToOpenApp" promise used by the OpenApp
 * and ReconnectApp API commands to wait until the UI is mounted and ready.
 *
 * Call this hook in pages that are entry points for users (e.g., DomainInitialPage,
 * WorkspaceInitialPage, SearchPage, etc.). The underlying function is idempotent -
 * calling it multiple times is safe as the promise resolves only once.
 */
function useConfirmReadyToOpenApp(): void {
    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);
}

export default useConfirmReadyToOpenApp;
