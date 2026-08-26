// No-op on native — hover states don't exist on mobile
function resetButtonHoverState(_addButtonRef?: unknown) {}

function isElementHovered(_ref?: unknown): boolean {
    return false;
}

export {resetButtonHoverState, isElementHovered};
