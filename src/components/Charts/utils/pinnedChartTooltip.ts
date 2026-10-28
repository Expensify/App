/** Hides the tooltip pinned by a touch tap */
let dismissPinnedTooltip: (() => void) | undefined;

/** Tooltip whose chart received the current touch */
let touchedTooltip: (() => void) | undefined;

/** Pins the given tooltip and hides the previous one */
function pinChartTooltip(dismiss: () => void) {
    if (dismissPinnedTooltip !== dismiss) {
        dismissPinnedTooltip?.();
    }
    dismissPinnedTooltip = dismiss;
}

/** Forgets the given tooltip if it is still the pinned one */
function unpinChartTooltip(dismiss: () => void) {
    if (dismissPinnedTooltip !== dismiss) {
        return;
    }
    dismissPinnedTooltip = undefined;
}

function markChartTouch(dismiss: (() => void) | undefined) {
    touchedTooltip = dismiss;
}

/** Hides the pinned tooltip, unless the touch landed on its own chart */
function dismissPinnedChartTooltip() {
    const isOwnChartTouch = !!touchedTooltip && touchedTooltip === dismissPinnedTooltip;
    touchedTooltip = undefined;
    if (isOwnChartTouch) {
        return;
    }
    const dismiss = dismissPinnedTooltip;
    dismissPinnedTooltip = undefined;
    dismiss?.();
}

export {pinChartTooltip, unpinChartTooltip, markChartTouch, dismissPinnedChartTooltip};
