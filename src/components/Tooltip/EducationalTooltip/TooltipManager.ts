const pendingTooltips = new Set<NodeJS.Timeout>();
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
