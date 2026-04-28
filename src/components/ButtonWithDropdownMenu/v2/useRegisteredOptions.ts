import {useState} from 'react';
import type {MenuRegistryActions, RegisteredItemEntry, RegisteredOptionEntry} from './MenuContext';

type RegisteredOptionsSnapshot = {
    actions: MenuRegistryActions;
    topLevelEntries: RegisteredItemEntry[];
    submenuChildren: Map<string, RegisteredOptionEntry[]>;
};

function comparePosition(a: RegisteredItemEntry, b: RegisteredItemEntry): number {
    return a.position - b.position;
}

// Stable `actions` (lazy useState) for descriptor effects; sorted by position so remounts land in JSX order.
function useRegisteredOptions(): RegisteredOptionsSnapshot {
    const [items, setItems] = useState<Map<string, RegisteredItemEntry>>(() => new Map());
    const [actions] = useState<MenuRegistryActions>(() => ({
        registerItem: (entry) =>
            setItems((current) => {
                const next = new Map(current);
                next.set(entry.id, entry);
                return next;
            }),
        unregisterItem: (id) =>
            setItems((current) => {
                if (!current.has(id)) {
                    return current;
                }
                const next = new Map(current);
                next.delete(id);
                return next;
            }),
    }));

    const topLevelEntries: RegisteredItemEntry[] = [];
    const submenuChildren = new Map<string, RegisteredOptionEntry[]>();

    for (const entry of items.values()) {
        if (entry.kind === 'submenu') {
            topLevelEntries.push(entry);
            if (!submenuChildren.has(entry.id)) {
                submenuChildren.set(entry.id, []);
            }
            continue;
        }
        if (entry.parentSubmenuId === undefined) {
            topLevelEntries.push(entry);
            continue;
        }
        const list = submenuChildren.get(entry.parentSubmenuId) ?? [];
        list.push(entry);
        submenuChildren.set(entry.parentSubmenuId, list);
    }

    topLevelEntries.sort(comparePosition);
    for (const list of submenuChildren.values()) {
        list.sort(comparePosition);
    }

    return {actions, topLevelEntries, submenuChildren};
}

export default useRegisteredOptions;
