import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';

/**
 * Captures the selected keys at the moment a screen gains focus so ordering
 * logic can use a stable snapshot while the screen remains mounted.
 */
function useInitialSelectionSnapshot(selectedKeys: string[], hasUserInteracted = false) {
    const isFocused = useIsFocused();
    const initialSelectedKeysRef = useRef<string[]>([]);
    const hasCapturedSnapshotRef = useRef(false);
    const previousIsFocusedRef = useRef(false);
    const [snapshotVersion, setSnapshotVersion] = useState(0);

    // Reset snapshot when focus is regained
    useEffect(() => {
        const wasFocused = previousIsFocusedRef.current;
        if (isFocused && !wasFocused) {
            initialSelectedKeysRef.current = selectedKeys;
            hasCapturedSnapshotRef.current = selectedKeys.length > 0;
            setSnapshotVersion((version) => version + 1);
        } else if (!isFocused && wasFocused) {
            hasCapturedSnapshotRef.current = false;
        }
        previousIsFocusedRef.current = isFocused;
    }, [isFocused, selectedKeys]);

    // If selection loads after focus, capture it once without updating on subsequent toggles
    useEffect(() => {
        if (!isFocused || hasCapturedSnapshotRef.current || selectedKeys.length === 0 || hasUserInteracted) {
            return;
        }
        initialSelectedKeysRef.current = selectedKeys;
        hasCapturedSnapshotRef.current = true;
        setSnapshotVersion((version) => version + 1);
    }, [hasUserInteracted, isFocused, selectedKeys]);

    return {
        initialSelectedKeys: initialSelectedKeysRef.current,
        snapshotVersion,
    };
}

export default useInitialSelectionSnapshot;
