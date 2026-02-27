import {useSyncExternalStore} from 'react';
import type UseActiveElementRole from './types';

function subscribe(callback: () => void) {
    document.addEventListener('focusin', callback);
    document.addEventListener('focusout', callback);
    return () => {
        document.removeEventListener('focusin', callback);
        document.removeEventListener('focusout', callback);
    };
}

function getSnapshot() {
    return document.activeElement?.role ?? null;
}

const useActiveElementRole: UseActiveElementRole = () => useSyncExternalStore(subscribe, getSnapshot);

export default useActiveElementRole;
