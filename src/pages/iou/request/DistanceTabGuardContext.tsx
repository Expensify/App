/**
 * Lets the active distance tab register discard callbacks that `DistanceRequestStartPage` reads to show the
 * "Discard changes?" modal on tab switch / back. Only one guard is active at a time.
 */
import {createContext, useContext, useEffect, useRef} from 'react';

type DistanceTabGuard = {
    tabName: string;
    getHasUnsavedChanges: () => boolean;
    onDiscard: () => void | Promise<void>;
};

type RegisterDistanceTabGuard = (guard: DistanceTabGuard) => () => void;

const DistanceTabGuardContext = createContext<RegisterDistanceTabGuard | null>(null);

function useRegisterDistanceTabGuard(tabName: string, getHasUnsavedChanges: () => boolean, onDiscard: () => void | Promise<void>) {
    const register = useContext(DistanceTabGuardContext);
    const guardCallbacksRef = useRef({getHasUnsavedChanges, onDiscard});

    useEffect(() => {
        guardCallbacksRef.current = {getHasUnsavedChanges, onDiscard};
    });

    useEffect(() => {
        if (!register) {
            return undefined;
        }
        return register({
            tabName,
            getHasUnsavedChanges: () => guardCallbacksRef.current.getHasUnsavedChanges(),
            onDiscard: () => guardCallbacksRef.current.onDiscard(),
        });
    }, [register, tabName]);
}

export default DistanceTabGuardContext;
export {useRegisterDistanceTabGuard};
export type {DistanceTabGuard, RegisterDistanceTabGuard};
