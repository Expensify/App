let isInboxTabPreloaded = false;

function getIsInboxTabPreloaded() {
    return isInboxTabPreloaded;
}

function markInboxTabPreloaded() {
    isInboxTabPreloaded = true;
}

/** Sign-out unmounts the tab navigator without tearing down the JS runtime, so the flag has to be cleared with it. */
function resetInboxTabPreloaded() {
    isInboxTabPreloaded = false;
}

export {getIsInboxTabPreloaded, markInboxTabPreloaded, resetInboxTabPreloaded};
