/**
 * determine if node is editable
 */

const isNodeEditable = (node: HTMLElement | Node) => {
    // the node here could be text node, so we should try finding the nearest ancestor node of type: Element
    let ancestorNodeToCheck: HTMLElement | Node | null = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (ancestorNodeToCheck && ancestorNodeToCheck.nodeType !== Node.ELEMENT_NODE) {
        ancestorNodeToCheck = ancestorNodeToCheck.parentElement;
    }

    // couldn't find closest ancestor node that is an element node
    if (!ancestorNodeToCheck) {
        // if the design mode is on, we should consider the node as editable
        return document.designMode.toLowerCase() === 'on';
    }

    // check the tag name (input, textarea,...)
    const nodeName = ancestorNodeToCheck.nodeName.toLowerCase();

    // in case of input/textarea or contenteditable element, we should consider it as editable
    // since contenteditable is inherit, isContentEditable always returns true if the element is a child of a contenteditable element
    if (nodeName === 'input' || nodeName === 'textarea' || (ancestorNodeToCheck as HTMLElement).isContentEditable) {
        return true;
    }
};

const clearRedundantSelectionRanges = () => {
    const selection = window.getSelection();

    if (!selection?.rangeCount) {
        return;
    }

    const rangesNeedToBeRemove: Range[] = [];
    for (let i = 0; i < selection.rangeCount; ++i) {
        const range = selection.getRangeAt(i);
        // if a selection range is not editable, we should remove it as it's likely for the tap-to-search feature on Chrome
        if (!isNodeEditable(range.commonAncestorContainer as HTMLElement)) {
            rangesNeedToBeRemove.push(range);
        }
    }

    rangesNeedToBeRemove.forEach((range) => {
        selection.removeRange(range);
    });
};

export default clearRedundantSelectionRanges;
