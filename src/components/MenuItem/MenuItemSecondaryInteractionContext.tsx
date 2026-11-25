import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ComponentRef, Dispatch, SetStateAction} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

import {createContext, useContext, useEffect, useRef, useState} from 'react';

/**
 * Handles a long press or a right-click on the row. `anchor` is the row's own pressable, handed over
 * so a sub-component can anchor a popover to the whole row without the call site threading a ref down.
 */
type MenuItemSecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent, anchor: ComponentRef<typeof View> | null) => void;

/** A registered handler with the label the row reports it under when the row has no label of its own */
type MenuItemSecondaryInteraction = {
    handler: MenuItemSecondaryInteractionHandler;
    sentryLabel: SentryLabel;
};

/** Takes over the row's long press / right-click. Returns the callback that gives it back */
type RegisterMenuItemSecondaryInteraction = (interaction: MenuItemSecondaryInteraction) => () => void;

const MenuItemSecondaryInteractionContext = createContext<RegisterMenuItemSecondaryInteraction | undefined>(undefined);

/**
 * Routes the row's long press and right-click to this sub-component, so a leaf can own a row-wide
 * behaviour it cannot reach through props. No-op outside a `MenuItem.Root`, or while `handler` is undefined.
 */
function useMenuItemSecondaryInteraction(handler: MenuItemSecondaryInteractionHandler | undefined, sentryLabel: SentryLabel) {
    const register = useContext(MenuItemSecondaryInteractionContext);
    const isEnabled = !!handler;

    // A stable wrapper keeps a handler that closes over changing values, like the copied text, from
    // re-registering on every change and churning the row's state
    const handlerRef = useRef<MenuItemSecondaryInteractionHandler | undefined>(handler);
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    // Built once and kept, so re-registering the same sub-component is the no-op the registry expects
    const registeredInteractionRef = useRef<MenuItemSecondaryInteraction | undefined>(undefined);

    useEffect(() => {
        if (!isEnabled || !register) {
            return;
        }
        if (registeredInteractionRef.current?.sentryLabel !== sentryLabel) {
            registeredInteractionRef.current = {handler: (event, anchor) => handlerRef.current?.(event, anchor), sentryLabel};
        }
        return register(registeredInteractionRef.current);
    }, [isEnabled, register, sentryLabel]);
}

/** Builds the row's `register` around its state setter, outside the hook so the identity has nothing to close over per render */
function createSecondaryInteractionRegister(setInteraction: Dispatch<SetStateAction<MenuItemSecondaryInteraction | undefined>>): RegisterMenuItemSecondaryInteraction {
    return (nextInteraction) => {
        setInteraction((currentInteraction: MenuItemSecondaryInteraction | undefined) => (currentInteraction === nextInteraction ? currentInteraction : nextInteraction));

        // A later registrant may own the row by now, so only give it back if it is still ours
        return () => setInteraction((currentInteraction: MenuItemSecondaryInteraction | undefined) => (currentInteraction === nextInteraction ? undefined : currentInteraction));
    };
}

/**
 * The row's side of the registry: the handler a sub-component took the row over with and its label, if any, and
 * the `register` to publish to them. Re-registering the interaction already in place is a no-op.
 */
function useMenuItemSecondaryInteractionRegistry() {
    const [interaction, setInteraction] = useState<MenuItemSecondaryInteraction | undefined>(undefined);

    // Built once and kept, the same way a sub-component keeps the handler it hands over: `register` is an
    // effect dependency on their side, so a fresh identity every render would re-register on every render
    const [register] = useState<RegisterMenuItemSecondaryInteraction>(() => createSecondaryInteractionRegister(setInteraction));

    return {interaction, register};
}

export default MenuItemSecondaryInteractionContext;
export {useMenuItemSecondaryInteraction, useMenuItemSecondaryInteractionRegistry};
