import type {GestureResponderEvent, View} from 'react-native';

import {createContext, useContext, useEffect, useRef, useState} from 'react';

/**
 * Handles a long press or a right-click on the row. `anchor` is the row's own pressable, which
 * `MenuItem.Root` hands over so a sub-component can position a popover against the whole row
 * without the call site having to thread a ref down.
 */
type MenuItemSecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent, anchor: View | null) => void;

/** Takes over the row's long press / right-click. Returns the callback that gives it back */
type RegisterMenuItemSecondaryInteraction = (handler: MenuItemSecondaryInteractionHandler) => () => void;

const MenuItemSecondaryInteractionContext = createContext<RegisterMenuItemSecondaryInteraction | undefined>(undefined);

/**
 * Routes the row's long press and right-click to this sub-component, so a leaf can own a row-wide
 * behaviour it cannot reach through props. No-op outside a `MenuItem.Root`, and no-op while
 * `handler` is undefined — pass undefined to leave the row's default behaviour alone.
 */
function useMenuItemSecondaryInteraction(handler: MenuItemSecondaryInteractionHandler | undefined) {
    const register = useContext(MenuItemSecondaryInteractionContext);
    const isEnabled = !!handler;

    // Registering a stable wrapper keeps a handler that closes over changing values (the copied text,
    // say) from re-registering, which in turn keeps the row's state still
    const handlerRef = useRef<MenuItemSecondaryInteractionHandler | undefined>(handler);
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!isEnabled || !register) {
            return;
        }
        return register((event, anchor) => handlerRef.current?.(event, anchor));
    }, [isEnabled, register]);
}

/**
 * The row's side of the registry: the handler a sub-component took the row over with, if any, and
 * the `register` to publish to them.
 *
 * The handler lives in state rather than a ref because the row has to know during render whether it
 * has one: a row with nobody registered passes `undefined` to its pressable, and that is what leaves
 * the native context menu in place on the web instead of swallowing every right-click.
 */
function useMenuItemSecondaryInteractionRegistry() {
    const [handler, setHandler] = useState<MenuItemSecondaryInteractionHandler | undefined>(undefined);

    const register: RegisterMenuItemSecondaryInteraction = (nextHandler) => {
        setHandler(() => nextHandler);

        // A later registrant may already own the row by now, so only give it back if it is still ours
        return () => setHandler((currentHandler: MenuItemSecondaryInteractionHandler | undefined) => (currentHandler === nextHandler ? undefined : currentHandler));
    };

    return {handler, register};
}

export default MenuItemSecondaryInteractionContext;
export type {MenuItemSecondaryInteractionHandler};
export {useMenuItemSecondaryInteraction, useMenuItemSecondaryInteractionRegistry};
