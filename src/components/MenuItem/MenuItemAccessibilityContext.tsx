import type {TupleToUnion} from 'type-fest';

import {createContext, useContext, useEffect, useState} from 'react';

/**
 * Label slots a `MenuItem` row can contribute, in the order they are announced. Keyed by line rather
 * than role, so the announced order matches the visual one for both field and navigation rows.
 */
const MENU_ITEM_LABEL_SLOTS = ['top', 'bottom'] as const;

type MenuItemLabelSlot = TupleToUnion<typeof MENU_ITEM_LABEL_SLOTS>;

type MenuItemAccessibilityActions = {
    /** Registers a label (the title or description text) under a fixed slot key */
    registerLabel: (slot: MenuItemLabelSlot, text: string) => void;

    /** Removes the label registered under the given slot */
    unregisterLabel: (slot: MenuItemLabelSlot) => void;
};

const MenuItemAccessibilityContext = createContext<MenuItemAccessibilityActions | undefined>(undefined);

/**
 * Contributes text to the label `MenuItem.Root` derives. Registered under a fixed slot key so the
 * announced order is deterministic (`top`, then `bottom`) regardless of mount/render timing.
 * No-op when `text` is empty or when rendered outside a `MenuItem.Root`.
 */
function useMenuItemAccessibilityLabel(slot: MenuItemLabelSlot, text: string | undefined) {
    const actions = useContext(MenuItemAccessibilityContext);
    const registerLabel = actions?.registerLabel;
    const unregisterLabel = actions?.unregisterLabel;

    useEffect(() => {
        if (!text || !registerLabel || !unregisterLabel) {
            return;
        }
        registerLabel(slot, text);
        return () => unregisterLabel(slot);
    }, [slot, text, registerLabel, unregisterLabel]);
}

/**
 * Small `slot -> text` registry backed by an immutable `Map`.
 * Writes are no-ops when the value is unchanged, so unrelated re-renders don't churn the map identity.
 */
function useLabelSlotRegistry() {
    const [entries, setEntries] = useState<Map<MenuItemLabelSlot, string>>(() => new Map());

    const register = (slot: MenuItemLabelSlot, value: string) => {
        setEntries((prev) => {
            if (prev.get(slot) === value) {
                return prev;
            }
            const next = new Map(prev);
            next.set(slot, value);
            return next;
        });
    };

    const unregister = (slot: MenuItemLabelSlot) => {
        setEntries((prev) => {
            if (!prev.has(slot)) {
                return prev;
            }
            const next = new Map(prev);
            next.delete(slot);
            return next;
        });
    };

    return {entries, register, unregister};
}

/**
 * Collects the text registered by `Title`/`Description` sub-components and derives the row's accessibility label.
 * Returns the props to spread on the pressable plus the value for `MenuItemAccessibilityContext.Provider`.
 */
function useMenuItemAccessibility() {
    // Text contributed by the text leaves, keyed by the line each one occupies
    const {entries: labels, register: registerLabel, unregister: unregisterLabel} = useLabelSlotRegistry();

    const accessibilityActions: MenuItemAccessibilityActions = {registerLabel, unregisterLabel};

    const accessibilityLabel = MENU_ITEM_LABEL_SLOTS.map((slot) => labels.get(slot))
        .filter(Boolean)
        .join(', ');

    return {accessibilityLabel, accessibilityActions};
}

export default MenuItemAccessibilityContext;
export type {MenuItemLabelSlot};
export {useMenuItemAccessibilityLabel, useMenuItemAccessibility};
