const pendingTooltip: NodeJS.Timeout[] = [];
const tooltipCloseCallback: Array<() => void> = [];

function addPendingTooltip(timeout: NodeJS.Timeout) {
    pendingTooltip.push(timeout);
    return () => {
        const index = pendingTooltip.indexOf(timeout);
        pendingTooltip.splice(index, 1);
    };
}

function addActiveTooltip(closeCallback: () => void) {
    tooltipCloseCallback.push(closeCallback);
    return () => {
        const index = tooltipCloseCallback.indexOf(closeCallback);
        tooltipCloseCallback.splice(index, 1);
    };
}

function cancelPendingAndActiveTooltips() {
    while (pendingTooltip.length > 0) {
        clearTimeout(pendingTooltip.pop());
    }
    while (tooltipCloseCallback.length > 0) {
        tooltipCloseCallback.pop()?.();
    }
}

export {addPendingTooltip, addActiveTooltip, cancelPendingAndActiveTooltips};
