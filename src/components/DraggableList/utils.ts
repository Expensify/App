type ItemLayout = {
    offset: number;
    size: number;
};

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(fromIndex, 1);
    if (movedItem === undefined) {
        return items;
    }
    reorderedItems.splice(toIndex, 0, movedItem);
    return reorderedItems;
}

function getDragTargetIndex(itemLayouts: Array<ItemLayout | undefined>, activeIndex: number, translationY: number): number {
    const activeLayout = itemLayouts.at(activeIndex);
    if (!activeLayout) {
        return activeIndex;
    }
    const activeCenter = activeLayout.offset + activeLayout.size / 2 + translationY;
    let targetIndex = activeIndex;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const [index, layout] of itemLayouts.entries()) {
        if (!layout) {
            continue;
        }
        const distance = Math.abs(layout.offset + layout.size / 2 - activeCenter);
        if (distance >= nearestDistance) {
            continue;
        }
        nearestDistance = distance;
        targetIndex = index;
    }
    return targetIndex;
}

export {getDragTargetIndex, reorderItems};
