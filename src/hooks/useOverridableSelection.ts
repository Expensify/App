/**
 * Tracks a multi-select list's checked keys on top of a selection that comes from saved data. Until the user changes
 * something the selection follows the saved data, so it stays correct when that data loads after the page opens.
 */
import {useState} from 'react';

function useOverridableSelection(initialSelection: string[]) {
    // Undefined until the user changes something, so the selection keeps following initialSelection until then.
    const [selectionOverride, setSelectionOverride] = useState<string[]>();
    const selectedKeys = selectionOverride ?? initialSelection;

    const toggleKey = (key: string) => {
        setSelectionOverride((previous) => {
            const selection = previous ?? initialSelection;
            return selection.includes(key) ? selection.filter((selectedKey) => selectedKey !== key) : [...selection, key];
        });
    };

    /** Checks every visible key, or unchecks them all when they're already checked. Keys hidden by a search keep their state. */
    const toggleVisibleKeys = (visibleKeys: string[]) => {
        const areAllVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedKeys.includes(key));

        if (areAllVisibleSelected) {
            const visibleSet = new Set(visibleKeys);
            setSelectionOverride((previous) => (previous ?? initialSelection).filter((key) => !visibleSet.has(key)));
            return;
        }

        setSelectionOverride((previous) => Array.from(new Set([...(previous ?? initialSelection), ...visibleKeys])));
    };

    return {selectedKeys, toggleKey, toggleVisibleKeys};
}

export default useOverridableSelection;
