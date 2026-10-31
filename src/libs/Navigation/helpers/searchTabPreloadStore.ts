// State of the Spend tab preloaded at idle, shared between the tab button and the tab's navigator, which sit in different trees.

// Whether the pointer rests on the Spend tab button. The preloaded tab is frozen once built, and unfreezes while hovered so it
// catches up on the data changes it skipped before the click, instead of after it.
let isSearchTabHovered = false;
const hoverListeners = new Set<() => void>();

// Whether the preloaded Spend tab has its first content on screen, so a tap on it only reveals a built screen.
let isContentReady = false;

function setIsSearchTabHovered(isHovered: boolean) {
    if (isSearchTabHovered === isHovered) {
        return;
    }
    isSearchTabHovered = isHovered;
    for (const listener of hoverListeners) {
        listener();
    }
}

function getIsSearchTabHovered() {
    return isSearchTabHovered;
}

function subscribeToSearchTabHover(listener: () => void) {
    hoverListeners.add(listener);
    return () => {
        hoverListeners.delete(listener);
    };
}

function markSearchTabContentReady() {
    isContentReady = true;
}

function clearSearchTabContentReady() {
    isContentReady = false;
}

function isSearchTabContentReady() {
    return isContentReady;
}

export {clearSearchTabContentReady, getIsSearchTabHovered, isSearchTabContentReady, markSearchTabContentReady, setIsSearchTabHovered, subscribeToSearchTabHover};
