/**
 * Lets a tab screen register discard callbacks that `OnyxTabNavigator` reads to show the "Discard changes?"
 * modal when the user presses a different tab with unsaved changes. Guards are keyed by tab name, so each
 * tab in a navigator can register its own without clobbering the others.
 */
import {createContext, useContext, useEffect, useRef} from 'react';

type TabSwitchGuard = {
    tabName: string;
    getHasUnsavedChanges: () => boolean;
    onDiscard: () => void | Promise<void>;
    onCancel?: () => void;
};

type RegisterTabSwitchGuard = (guard: TabSwitchGuard) => () => void;

const TabSwitchGuardContext = createContext<RegisterTabSwitchGuard | null>(null);

function useRegisterTabSwitchGuard(tabName: string, getHasUnsavedChanges: () => boolean, onDiscard?: () => void | Promise<void>, onCancel?: () => void) {
    const register = useContext(TabSwitchGuardContext);
    // Refresh the closures every render so the stable guard registered below always calls the latest ones.
    const guardCallbacksRef = useRef({getHasUnsavedChanges, onDiscard, onCancel});

    useEffect(() => {
        guardCallbacksRef.current = {getHasUnsavedChanges, onDiscard, onCancel};
    });

    // Opt-in: only register when there's a tab provider and an onDiscard to run, so callers outside a tabbed flow are unaffected.
    const canRegister = !!register && !!onDiscard;
    useEffect(() => {
        if (!register || !canRegister) {
            return undefined;
        }
        return register({
            tabName,
            getHasUnsavedChanges: () => guardCallbacksRef.current.getHasUnsavedChanges(),
            onDiscard: () => guardCallbacksRef.current.onDiscard?.(),
            onCancel: () => guardCallbacksRef.current.onCancel?.(),
        });
    }, [register, tabName, canRegister]);
}

export default TabSwitchGuardContext;
export {useRegisterTabSwitchGuard};
export type {TabSwitchGuard, RegisterTabSwitchGuard};
