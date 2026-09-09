import type {TupleToUnion, ValueOf} from 'type-fest';

import {createContext, useContext, useEffect, useState} from 'react';

/** The text slots a `MenuItem` row can contribute to its label, in the order they are announced */
const MENU_ITEM_LABEL_SLOTS = ['title', 'description'] as const;

type MenuItemLabelSlot = TupleToUnion<typeof MENU_ITEM_LABEL_SLOTS>;

/** Accessibility facts a sub-component can contribute about its row, announced after the label as their own sentences */
const MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT = {
    OPENS_IN_NEW_TAB: 'opensInNewTab',
} as const;

type MenuItemAccessibilityAnnouncement = ValueOf<typeof MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT>;

/** The announcement slots in the order they are announced */
const MENU_ITEM_ANNOUNCEMENT_SLOTS = Object.values(MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT);

type MenuItemAccessibilityActions = {
    /** Registers a label (the title or description text) under a fixed slot key */
    registerLabel: (slot: MenuItemLabelSlot, text: string) => void;

    /** Removes the label registered under the given slot */
    unregisterLabel: (slot: MenuItemLabelSlot) => void;

    /** Announces a fact about the row under a fixed slot key. Announcing the same fact twice announces it once */
    registerAnnouncement: (announcement: MenuItemAccessibilityAnnouncement, text: string) => void;

    /** Stops announcing the given fact */
    unregisterAnnouncement: (announcement: MenuItemAccessibilityAnnouncement) => void;
};

const MenuItemAccessibilityContext = createContext<MenuItemAccessibilityActions | undefined>(undefined);

/**
 * Contributes text to the label `MenuItem.Root` derives. Registered under a fixed slot key so the
 * announced order is deterministic (`title`, then `description`) regardless of mount/render timing
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

/** Contributes an already translated announcement about the row */
function useMenuItemAccessibilityAnnouncement(announcement: MenuItemAccessibilityAnnouncement | undefined, text: string | undefined) {
    const actions = useContext(MenuItemAccessibilityContext);
    const registerAnnouncement = actions?.registerAnnouncement;
    const unregisterAnnouncement = actions?.unregisterAnnouncement;

    useEffect(() => {
        if (!announcement || !text || !registerAnnouncement || !unregisterAnnouncement) {
            return;
        }
        registerAnnouncement(announcement, text);
        return () => unregisterAnnouncement(announcement);
    }, [announcement, text, registerAnnouncement, unregisterAnnouncement]);
}

/** Small `key -> value` registry backed by an immutable `Map`.
 * Writes are no-ops when the value is unchanged, so unrelated re-renders don't churn the map identity
 */
function useKeyedRegistry<TKey, TValue>() {
    const [entries, setEntries] = useState<Map<TKey, TValue>>(() => new Map());

    const register = (key: TKey, value: TValue) => {
        setEntries((prev) => {
            if (prev.get(key) === value) {
                return prev;
            }
            const next = new Map(prev);
            next.set(key, value);
            return next;
        });
    };

    const unregister = (key: TKey) => {
        setEntries((prev) => {
            if (!prev.has(key)) {
                return prev;
            }
            const next = new Map(prev);
            next.delete(key);
            return next;
        });
    };

    return {entries, register, unregister};
}

/** Assembles the row's accessibility label from what its sub-components registered, plus the value for `MenuItemAccessibilityContext.Provider` */
function useMenuItemAccessibility() {
    // Text contributed by Title/Description children, keyed by slot
    const {entries: labels, register: registerLabel, unregister: unregisterLabel} = useKeyedRegistry<MenuItemLabelSlot, string>();

    // Facts contributed by any child, keyed by the fact
    const {entries: announcements, register: registerAnnouncement, unregister: unregisterAnnouncement} = useKeyedRegistry<MenuItemAccessibilityAnnouncement, string>();

    const accessibilityActions: MenuItemAccessibilityActions = {registerLabel, unregisterLabel, registerAnnouncement, unregisterAnnouncement};

    const derivedLabel = MENU_ITEM_LABEL_SLOTS.map((slot) => labels.get(slot))
        .filter(Boolean)
        .join(', ');

    const announcementTexts = MENU_ITEM_ANNOUNCEMENT_SLOTS.map((announcement) => announcements.get(announcement)).filter(Boolean);
    const accessibilityLabel = [derivedLabel, ...announcementTexts].filter(Boolean).join('. ');

    return {accessibilityLabel, accessibilityActions};
}

export default MenuItemAccessibilityContext;
export {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityLabel, useMenuItemAccessibilityAnnouncement, useMenuItemAccessibility};
