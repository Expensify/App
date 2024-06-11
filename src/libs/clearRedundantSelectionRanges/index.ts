const isNodeEditable = (node: HTMLElement) => {
    let ancestorNodeToCheck = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (ancestorNodeToCheck && ancestorNodeToCheck.nodeType !== Node.ELEMENT_NODE) {
        ancestorNodeToCheck = ancestorNodeToCheck.parentElement;
    }

    // couldn't find closest ancestor node that is an element node
    if (!ancestorNodeToCheck) {
        return document.designMode.toLowerCase() === 'on';
    }

    const nodeName = ancestorNodeToCheck.nodeName.toLowerCase();

    if (nodeName === 'input' || nodeName === 'textarea' || ancestorNodeToCheck.isContentEditable) {
        return true;
    }
};

const clearRedundantSelectionRanges = () => {
    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) {
        return;
    }

    let rangesNeedToBeRemove: Range[] = [];
    for (let i = 0; i < selection.rangeCount; ++i) {
        const range = selection.getRangeAt(i);
        if (isNodeEditable(range.commonAncestorContainer as HTMLElement)) {
            continue;
        }
        rangesNeedToBeRemove.push(range);
    }

    rangesNeedToBeRemove.forEach((range) => {
        selection.removeRange(range);
    });
};

export default clearRedundantSelectionRanges;
