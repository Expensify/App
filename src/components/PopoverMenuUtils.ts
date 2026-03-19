import FocusUtils from '@libs/focusUtils';

type PopoverMenuTreeItem = {
    text: string;
    key?: string;
    subMenuItems?: PopoverMenuTreeItem[];
};

function getInitialFocusTargetFromContainer(container: HTMLElement): HTMLElement | false {
    const candidates = container.querySelectorAll('[role="button"], [role="menuitem"]');
    for (const candidate of candidates) {
        if (FocusUtils.isFocusableActionableElement(candidate)) {
            return candidate;
        }
    }
    return false;
}

function getItemKey(item: Pick<PopoverMenuTreeItem, 'key' | 'text'>): string {
    return item.key ?? item.text;
}

function getItemAtIndex(items: PopoverMenuTreeItem[] | undefined, index: number): PopoverMenuTreeItem | undefined {
    return items?.find((_item, itemIndex) => itemIndex === index);
}

function buildKeyPathFromIndexPath(root: PopoverMenuTreeItem[], indexPath: readonly number[]): string[] {
    const keys: string[] = [];
    let level: PopoverMenuTreeItem[] | undefined = root;

    for (const idx of indexPath) {
        const node = getItemAtIndex(level, idx);
        if (!node) {
            break;
        }
        keys.push(getItemKey(node));
        level = node.subMenuItems;
    }

    return keys;
}

function resolveIndexPathByKeyPath(root: PopoverMenuTreeItem[], keyPath: string[]) {
    let level: PopoverMenuTreeItem[] = root;
    const indexes: number[] = [];

    for (const key of keyPath) {
        const index = level.findIndex((node) => getItemKey(node) === key);
        if (index === -1) {
            return {found: false as const};
        }

        indexes.push(index);
        const selectedItem = getItemAtIndex(level, index);
        level = selectedItem?.subMenuItems ?? [];
    }

    return {found: true as const, indexes, itemsAtLeaf: level};
}

export {buildKeyPathFromIndexPath, getInitialFocusTargetFromContainer, getItemKey, resolveIndexPathByKeyPath};
