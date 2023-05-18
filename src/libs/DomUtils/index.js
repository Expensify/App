function blurActiveElement() {
    document.activeElement.blur();
}

/**
 * Check whether the given element is in the DOM subtree with the given root
 *
 * @param {Element} element - element to check
 * @param {Element} root - root of the subtree
 * @return {Boolean} - whether the given element is in the subtree
 */
function isInSubtree(element, root) {
    if (!element || !root) {
        return false;
    }

    if (element === root) {
        return true;
    }

    let currentNode = element.parentNode;

    while (currentNode !== null) {
        if (currentNode === root) {
            return true;
        }

        currentNode = currentNode.parentNode;
    }

    return false;
}

export default {
    blurActiveElement,
    isInSubtree,
};
