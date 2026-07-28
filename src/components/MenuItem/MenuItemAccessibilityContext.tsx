import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';

import useLocalize from '@hooks/useLocalize';

import type {TranslationPaths} from '@src/languages/types';

import type {ValueOf} from 'type-fest';

import {createContext, useContext, useEffect, useId, useState} from 'react';

/** Accessibility facts a sub-component contributes to the row's label */
const MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT = {
    OPENS_IN_NEW_TAB: 'opensInNewTab',
    REVIEW_REQUIRED: 'reviewRequired',
} as const;

type MenuItemAccessibilityAnnouncement = ValueOf<typeof MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT>;

const ANNOUNCEMENT_TRANSLATION_PATHS: Record<MenuItemAccessibilityAnnouncement, TranslationPaths> = {
    [MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.OPENS_IN_NEW_TAB]: 'common.opensInNewTab',
    [MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.REVIEW_REQUIRED]: 'common.yourReviewIsRequired',
};

type MenuItemAccessibilityActions = {
    /** Registers an announcement under the calling component's id */
    registerAnnouncement: (id: string, announcement: MenuItemAccessibilityAnnouncement) => void;

    /** Removes the calling component's announcement */
    unregisterAnnouncement: (id: string) => void;

    /** Registers a label (e.g. the title or description text) under the calling component's id */
    registerLabel: (id: string, text: string) => void;

    /** Removes the calling component's label */
    unregisterLabel: (id: string) => void;
};

const MenuItemAccessibilityContext = createContext<MenuItemAccessibilityActions | undefined>(undefined);

/**
 * Keeps `value` registered under a generated id for as long as the component is mounted.
 * No-op when `value` is empty or when the registry is missing (rendered outside a `MenuItem.Root`).
 */
function useMenuItemAccessibilityRegistration<T>(value: T | undefined, register: ((id: string, value: T) => void) | undefined, unregister: ((id: string) => void) | undefined) {
    const id = useId();

    useEffect(() => {
        if (!value || !register || !unregister) {
            return;
        }
        register(id, value);
        return () => unregister(id);
    }, [id, value, register, unregister]);
}

/**
 * Contributes an accessibility announcement to the enclosing `MenuItem.Root` label.
 * No-op when `announcement` is `undefined` or when rendered outside a `MenuItem.Root`.
 */
function useMenuItemAccessibilityAnnouncement(announcement: MenuItemAccessibilityAnnouncement | undefined) {
    const actions = useContext(MenuItemAccessibilityContext);

    useMenuItemAccessibilityRegistration(announcement, actions?.registerAnnouncement, actions?.unregisterAnnouncement);
}

/**
 * Contributes text to the label `MenuItem.Root` derives when no explicit `accessibilityLabel` is passed, joined in render order.
 * No-op when `text` is empty or when rendered outside a `MenuItem.Root`.
 */
function useMenuItemAccessibilityLabel(text: string | undefined) {
    const actions = useContext(MenuItemAccessibilityContext);

    useMenuItemAccessibilityRegistration(text, actions?.registerLabel, actions?.unregisterLabel);
}

/** Dedupes registered announcements, returning the translation paths to append to the label */
function getAnnouncementTranslationPaths(announcements: Iterable<MenuItemAccessibilityAnnouncement>): TranslationPaths[] {
    return new Set(announcements)
        .keys()
        .map((announcement) => ANNOUNCEMENT_TRANSLATION_PATHS[announcement])
        .toArray();
}

type UseMenuItemAccessibilityParams = {
    /** Explicit accessibility label. When omitted, the label is derived from the registered `Title`/`Description` text parts */
    accessibilityLabel?: string;

    /** Native accessibility hint, merged with the context menu hint on native */
    accessibilityHint?: string;

    /** Whether the announcement that a context menu is available should be added */
    shouldShowContextMenuHint?: boolean;
};

/**
 * Small `id -> value` registry backed by an immutable `Map`.
 * Writes are no-ops when the value is unchanged, so unrelated re-renders don't churn the map identity.
 */
function useIdKeyedRegistry<T>() {
    const [entries, setEntries] = useState<Map<string, T>>(() => new Map());

    const register = (id: string, value: T) => {
        setEntries((prev) => {
            if (prev.get(id) === value) {
                return prev;
            }
            const next = new Map(prev);
            next.set(id, value);
            return next;
        });
    };

    const unregister = (id: string) => {
        setEntries((prev) => {
            if (!prev.has(id)) {
                return prev;
            }
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    };

    return {entries, register, unregister};
}

/**
 * Collects the accessibility state registered by sub-components and assembles the label/hint: explicit-or-derived label, then announcements, then the context menu hint.
 * Returns the props to spread on the pressable plus the value for `MenuItemAccessibilityContext.Provider`.
 */
function useMenuItemAccessibility({accessibilityLabel, accessibilityHint, shouldShowContextMenuHint}: UseMenuItemAccessibilityParams) {
    const {translate} = useLocalize();

    // Announcements contributed by sub-components (e.g. Chevron with a NewWindow icon, BrickRoadIndicator)
    const {entries: announcements, register: registerAnnouncement, unregister: unregisterAnnouncement} = useIdKeyedRegistry<MenuItemAccessibilityAnnouncement>();

    // Text contributed by Title/Description children, in render order
    const {entries: labels, register: registerLabel, unregister: unregisterLabel} = useIdKeyedRegistry<string>();

    const derivedAccessibilityLabel = [...labels.values()].join(', ');
    const announcementLabels = getAnnouncementTranslationPaths(announcements.values()).map((translationPath) => translate(translationPath));
    const labelWithAnnouncements = [accessibilityLabel ?? derivedAccessibilityLabel, ...announcementLabels].filter(Boolean).join('. ');
    const contextMenuHint = shouldShowContextMenuHint ? getContextMenuAccessibilityHint({translate}) : undefined;
    const accessibilityProps = contextMenuHint
        ? getContextMenuAccessibilityProps({accessibilityLabel: labelWithAnnouncements, nativeAccessibilityHint: accessibilityHint, contextMenuHint})
        : {accessibilityLabel: labelWithAnnouncements, accessibilityHint};

    const providerValue: MenuItemAccessibilityActions = {registerAnnouncement, unregisterAnnouncement, registerLabel, unregisterLabel};

    return {accessibilityProps, providerValue};
}

export default MenuItemAccessibilityContext;
export {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityAnnouncement, useMenuItemAccessibilityLabel, useMenuItemAccessibility};
