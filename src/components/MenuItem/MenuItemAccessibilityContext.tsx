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
    REVIEW_REQUIRED: 'reviewRequired',
    CONTEXT_MENU_AVAILABLE: 'contextMenuAvailable',
} as const;

type MenuItemAccessibilityAnnouncement = ValueOf<typeof MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT>;

const MENU_ITEM_LABEL_ANNOUNCEMENT_SLOTS = [MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.OPENS_IN_NEW_TAB, MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.REVIEW_REQUIRED];
const MENU_ITEM_HINT_ANNOUNCEMENT_SLOTS = [MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.CONTEXT_MENU_AVAILABLE];

/** Where sub-components hand `MenuItem.Root` text, one entry per key */
type MenuItemAccessibilityRegistry<TKey> = {
    register: (key: TKey, text: string) => void;
    unregister: (key: TKey) => void;
};

type MenuItemAccessibilityRegistries = {
    /** Text leaves register their text here. Left out when the row names itself, so the leaves skip the work */
    label: MenuItemAccessibilityRegistry<MenuItemLabelSlot> | undefined;

    /** Leaves announce facts about the row here. Always there, since the facts are read even on a row that names itself */
    announcement: MenuItemAccessibilityRegistry<MenuItemAccessibilityAnnouncement>;
};

const MenuItemAccessibilityContext = createContext<MenuItemAccessibilityRegistries | undefined>(undefined);

/** Keeps `text` registered under `key` while the caller is mounted. No-op without a registry or text */
function useRegistration<TKey>(registry: MenuItemAccessibilityRegistry<TKey> | undefined, key: TKey, text: string | undefined) {
    const register = registry?.register;
    const unregister = registry?.unregister;

    useEffect(() => {
        if (!text || !register || !unregister) {
            return;
        }
        register(key, text);
        return () => unregister(key);
    }, [key, text, register, unregister]);
}

/** Contributes text to the label `MenuItem.Root` derives, announced in slot order (`top`, then `bottom`) */
function useMenuItemAccessibilityLabel(slot: MenuItemLabelSlot, text: string | undefined) {
    useRegistration(useContext(MenuItemAccessibilityContext)?.label, slot, text);
}

/** Contributes an already translated announcement about the row */
function useMenuItemAccessibilityAnnouncement(announcement: MenuItemAccessibilityAnnouncement, text: string | undefined) {
    useRegistration(useContext(MenuItemAccessibilityContext)?.announcement, announcement, text);
}

/**
 * Small `key -> text` registry backed by an immutable `Map`. Writing back an unchanged text is a
 * no-op, so unrelated re-renders don't churn the map identity.
 */
function useKeyedRegistry<TKey>() {
    const [entries, setEntries] = useState<Map<TKey, string>>(() => new Map());

    const registry: MenuItemAccessibilityRegistry<TKey> = {
        register: (key, text) => {
            setEntries((prev) => {
                if (prev.get(key) === text) {
                    return prev;
                }
                const next = new Map(prev);
                next.set(key, text);
                return next;
            });
        },
        unregister: (key) => {
            setEntries((prev) => {
                if (!prev.has(key)) {
                    return prev;
                }
                const next = new Map(prev);
                next.delete(key);
                return next;
            });
        },
    };

    return {entries, registry};
}

/**
 * Builds the row's accessibility label and hint out of what its sub-components registered. An explicit
 * `accessibilityLabel` replaces the derived one and switches the label registry off, but the announcements
 * are still appended to it.
 */
function useMenuItemAccessibility(accessibilityLabel?: string) {
    const labels = useKeyedRegistry<MenuItemLabelSlot>();
    const announcements = useKeyedRegistry<MenuItemAccessibilityAnnouncement>();

    const derivedLabel = MENU_ITEM_LABEL_SLOTS.map((slot) => labels.entries.get(slot))
        .filter(Boolean)
        .join(', ');
    const labelAnnouncements = MENU_ITEM_LABEL_ANNOUNCEMENT_SLOTS.map((announcement) => announcements.entries.get(announcement)).filter(Boolean);
    const hintAnnouncements = MENU_ITEM_HINT_ANNOUNCEMENT_SLOTS.map((announcement) => announcements.entries.get(announcement)).filter(Boolean);

    // Keeps the hints out of the name on native, and folds them into it on the web
    const accessibilityProps = getContextMenuAccessibilityProps({
        accessibilityLabel: [accessibilityLabel ?? derivedLabel, ...labelAnnouncements].filter(Boolean).join('. '),
        contextMenuHint: hintAnnouncements.join('. ') || undefined,
    });

    const registries: MenuItemAccessibilityRegistries = {
        label: accessibilityLabel === undefined ? labels.registry : undefined,
        announcement: announcements.registry,
    };

    return {...accessibilityProps, registries};
}

export type {MenuItemLabelSlot};
export default MenuItemAccessibilityContext;
export {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibility, useMenuItemAccessibilityAnnouncement, useMenuItemAccessibilityLabel};
