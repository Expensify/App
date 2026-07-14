// No-op on native — hover states don't exist on mobile
function resetButtonHoverState() {}

function isElementHovered(): boolean {
    return false;
}

export {resetButtonHoverState, isElementHovered};
