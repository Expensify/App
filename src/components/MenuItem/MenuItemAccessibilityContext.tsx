import {createContext, useCallback, useContext, useEffect, useId, useMemo, useState} from 'react';

type MenuItemAccessibilityActions = {
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
 * Contributes text to the label `MenuItem.Root` derives, joined in render order.
 * No-op when `text` is empty or when rendered outside a `MenuItem.Root`.
 */
function useMenuItemAccessibilityLabel(text: string | undefined) {
    const actions = useContext(MenuItemAccessibilityContext);

    useMenuItemAccessibilityRegistration(text, actions?.registerLabel, actions?.unregisterLabel);
}

/**
 * Small `id -> value` registry backed by an immutable `Map`.
 * Writes are no-ops when the value is unchanged, so unrelated re-renders don't churn the map identity.
 */
function useIdKeyedRegistry<T>() {
    const [entries, setEntries] = useState<Map<string, T>>(() => new Map());

    const register = useCallback((id: string, value: T) => {
        setEntries((prev) => {
            if (prev.get(id) === value) {
                return prev;
            }
            const next = new Map(prev);
            next.set(id, value);
            return next;
        });
    }, []);

    const unregister = useCallback((id: string) => {
        setEntries((prev) => {
            if (!prev.has(id)) {
                return prev;
            }
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    return {entries, register, unregister};
}

/**
 * Collects the text registered by `Title`/`Description` sub-components and derives the row's accessibility label.
 * Returns the props to spread on the pressable plus the value for `MenuItemAccessibilityContext.Provider`.
 */
function useMenuItemAccessibility() {
    // Text contributed by Title/Description children, in render order
    const {entries: labels, register: registerLabel, unregister: unregisterLabel} = useIdKeyedRegistry<string>();

    const accessibilityProps = {accessibilityLabel: [...labels.values()].join(', ')};

    const providerValue: MenuItemAccessibilityActions = useMemo(() => ({registerLabel, unregisterLabel}), [registerLabel, unregisterLabel]);

    return {accessibilityProps, providerValue};
}

export default MenuItemAccessibilityContext;
export {useMenuItemAccessibilityLabel, useMenuItemAccessibility};
