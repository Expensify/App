import type {Dispatch, SetStateAction} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

import {createContext, useContext, useEffect, useRef, useState} from 'react';

/**
 * Handles a long press or a right-click on the row. `anchor` is the row's own pressable, handed over
 * so a sub-component can anchor a popover to the whole row without the call site threading a ref down.
 */
type MenuItemSecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent, anchor: View | null) => void;

/** Takes over the row's long press / right-click. Returns the callback that gives it back */
type RegisterMenuItemSecondaryInteraction = (handler: MenuItemSecondaryInteractionHandler) => () => void;

const MenuItemSecondaryInteractionContext = createContext<RegisterMenuItemSecondaryInteraction | undefined>(undefined);

/**
 * Routes the row's long press and right-click to this sub-component, so a leaf can own a row-wide
 * behaviour it cannot reach through props. No-op outside a `MenuItem.Root`, or while `handler` is undefined.
 */
function useMenuItemSecondaryInteraction(handler: MenuItemSecondaryInteractionHandler | undefined) {
    const register = useContext(MenuItemSecondaryInteractionContext);
    const isEnabled = !!handler;

    // A stable wrapper keeps a handler that closes over changing values, like the copied text, from
    // re-registering on every change and churning the row's state
    const handlerRef = useRef<MenuItemSecondaryInteractionHandler | undefined>(handler);
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    // Built once and kept, so re-registering the same sub-component is the no-op the registry expects
    const registeredHandlerRef = useRef<MenuItemSecondaryInteractionHandler | undefined>(undefined);

    useEffect(() => {
        if (!isEnabled || !register) {
            return;
        }
        if (!registeredHandlerRef.current) {
            registeredHandlerRef.current = (event, anchor) => handlerRef.current?.(event, anchor);
        }
        return register(registeredHandlerRef.current);
    }, [isEnabled, register]);
}

/** Builds the row's `register` around its state setter, outside the hook so the identity has nothing to close over per render */
function createSecondaryInteractionRegister(setHandler: Dispatch<SetStateAction<MenuItemSecondaryInteractionHandler | undefined>>): RegisterMenuItemSecondaryInteraction {
    return (nextHandler) => {
        setHandler((currentHandler: MenuItemSecondaryInteractionHandler | undefined) => (currentHandler === nextHandler ? currentHandler : nextHandler));

        // A later registrant may own the row by now, so only give it back if it is still ours
        return () => setHandler((currentHandler: MenuItemSecondaryInteractionHandler | undefined) => (currentHandler === nextHandler ? undefined : currentHandler));
    };
}

/**
 * The row's side of the registry: the handler a sub-component took the row over with, if any, and the
 * `register` to publish to them. Re-registering the handler already in place is a no-op.
 */
function useMenuItemSecondaryInteractionRegistry() {
    const [handler, setHandler] = useState<MenuItemSecondaryInteractionHandler | undefined>(undefined);

    // Built once and kept, the same way a sub-component keeps the handler it hands over: `register` is an
    // effect dependency on their side, so a fresh identity every render would re-register on every render
    const [register] = useState<RegisterMenuItemSecondaryInteraction>(() => createSecondaryInteractionRegister(setHandler));

    return {handler, register};
}

export default MenuItemSecondaryInteractionContext;
export type {MenuItemSecondaryInteractionHandler};
export {useMenuItemSecondaryInteraction, useMenuItemSecondaryInteractionRegistry};
