/**
 * Native has no browser history, so there is nothing to restore. No-op counterpart of the web
 * implementation (see `index.web.ts`)
 */
function goForwardInBrowserHistory() {}

export default goForwardInBrowserHistory;
