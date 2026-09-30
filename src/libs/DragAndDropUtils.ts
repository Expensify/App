/**
 * Whether the dragged content contains files, which is the only payload our drop zones handle.
 */
function shouldAcceptDrop(event: DragEvent): boolean {
    return !!event.dataTransfer?.types.some((type) => type === 'Files');
}

// eslint-disable-next-line import/prefer-default-export
export {shouldAcceptDrop};
