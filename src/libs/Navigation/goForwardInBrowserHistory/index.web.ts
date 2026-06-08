/**
 * Moves the browser one entry forward, undoing a browser BACK press that we want to veto
 *
 * The browser BACK button moves the history pointer (and fires `popstate`) BEFORE JS can intercept it,
 * so react-navigation's `beforeRemove` `preventDefault()` keeps the screen mounted but cannot undo the
 * URL change. Without restoring the pointer the URL stays desynced and react-navigation keeps
 * re-dispatching the (blocked) RESET - re-opening the discard modal on every cancel. Going forward
 * resyncs the URL with the retained navigation state
 */
function goForwardInBrowserHistory() {
    window.history.go(1);
}

export default goForwardInBrowserHistory;
