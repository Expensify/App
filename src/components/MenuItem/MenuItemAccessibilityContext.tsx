import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';

import type {TupleToUnion, ValueOf} from 'type-fest';

import {createContext, useContext, useEffect, useState} from 'react';

/**
 * Label slots a `MenuItem` row can contribute, in the order they are announced. Keyed by line rather
 * than by role, so the announced order matches the visual one on both field and navigation rows.
 */
const MENU_ITEM_LABEL_SLOTS = ['top', 'bottom'] as const;

type MenuItemLabelSlot = TupleToUnion<typeof MENU_ITEM_LABEL_SLOTS>;

/** Facts a sub-component can contribute about its row, announced after the label as their own sentences */
const MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT = {
    OPENS_IN_NEW_TAB: 'opensInNewTab',
    CONTEXT_MENU_AVAILABLE: 'contextMenuAvailable',
} as const;

type MenuItemAccessibilityAnnouncement = ValueOf<typeof MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT>;

const MENU_ITEM_LABEL_ANNOUNCEMENT_SLOTS = [MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.OPENS_IN_NEW_TAB];
const MENU_ITEM_HINT_ANNOUNCEMENT_SLOTS = [MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.CONTEXT_MENU_AVAILABLE];

type MenuItemAccessibilityActions = {
    /** Registers a label (the title or description text) under a fixed slot key */
    registerLabel: (slot: MenuItemLabelSlot, text: string) => void;

    /** Removes the label registered under the given slot */
    unregisterLabel: (slot: MenuItemLabelSlot) => void;

    /** Announces a fact about the row under a fixed key. Announcing the same fact twice announces it once */
    registerAnnouncement: (announcement: MenuItemAccessibilityAnnouncement, text: string) => void;

    /** Stops announcing the given fact */
    unregisterAnnouncement: (announcement: MenuItemAccessibilityAnnouncement) => void;
};

const MenuItemAccessibilityContext = createContext<MenuItemAccessibilityActions | undefined>(undefined);

/**
 * Contributes text to the label `MenuItem.Root` derives. The fixed slot key keeps the announced order
 * deterministic (`top`, then `bottom`). No-op when `text` is empty or outside a `MenuItem.Root`.
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

/**
 * Small `key -> value` registry backed by an immutable `Map`. Writing back an unchanged value is a
 * no-op, so unrelated re-renders don't churn the map identity.
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

/**
 * Builds the row's accessibility label and hint out of what its sub-components registered, plus the
 * value for `MenuItemAccessibilityContext.Provider`
 */
function useMenuItemAccessibility() {
    // Text contributed by the text leaves, keyed by the line each one occupies
    const {entries: labels, register: registerLabel, unregister: unregisterLabel} = useKeyedRegistry<MenuItemLabelSlot, string>();

    // Facts contributed by any child, keyed by the fact
    const {entries: announcements, register: registerAnnouncement, unregister: unregisterAnnouncement} = useKeyedRegistry<MenuItemAccessibilityAnnouncement, string>();

    const accessibilityActions: MenuItemAccessibilityActions = {registerLabel, unregisterLabel, registerAnnouncement, unregisterAnnouncement};

    const derivedLabel = MENU_ITEM_LABEL_SLOTS.map((slot) => labels.get(slot))
        .filter(Boolean)
        .join(', ');

    const labelAnnouncements = MENU_ITEM_LABEL_ANNOUNCEMENT_SLOTS.map((announcement) => announcements.get(announcement)).filter(Boolean);
    const hintAnnouncements = MENU_ITEM_HINT_ANNOUNCEMENT_SLOTS.map((announcement) => announcements.get(announcement)).filter(Boolean);

    // Keeps the hints out of the name on native, and folds them into it on the web
    const {accessibilityLabel, accessibilityHint} = getContextMenuAccessibilityProps({
        accessibilityLabel: [derivedLabel, ...labelAnnouncements].filter(Boolean).join('. '),
        contextMenuHint: hintAnnouncements.join('. ') || undefined,
    });

    return {accessibilityLabel, accessibilityHint, accessibilityActions};
}

export default MenuItemAccessibilityContext;
export type {MenuItemLabelSlot};
export {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityLabel, useMenuItemAccessibilityAnnouncement, useMenuItemAccessibility};
