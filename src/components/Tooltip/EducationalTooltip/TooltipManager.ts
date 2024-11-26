// We store the timeouts for each pending tooltip here.
// We're using the timeout because when a tooltip is used inside an animated view (e.g., popover),
// we need to wait for the animation to finish before measuring content.
const pendingTooltips = new Set<NodeJS.Timeout>();

// We store the callback for closing a tooltip here.
const activeTooltips = new Set<() => void>();

function addPendingTooltip(timeout: NodeJS.Timeout) {
    pendingTooltips.add(timeout);
    return () => {
        pendingTooltips.delete(timeout);
    };
}

function addActiveTooltip(closeCallback: () => void) {
    activeTooltips.add(closeCallback);
    return () => {
        activeTooltips.delete(closeCallback);
    };
}

function cancelPendingAndActiveTooltips() {
    pendingTooltips.forEach((timeout) => clearTimeout(timeout));
    pendingTooltips.clear();
    activeTooltips.forEach((closeCallback) => closeCallback());
    activeTooltips.clear();
}

export {addPendingTooltip, addActiveTooltip, cancelPendingAndActiveTooltips};
