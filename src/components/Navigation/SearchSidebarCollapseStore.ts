import {useSyncExternalStore} from 'react';
import {Easing, makeMutable, withTiming} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';

const collapseProgress: SharedValue<number> = makeMutable(0);
let isCollapsed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return isCollapsed;
}

function toggleSidebar() {
    isCollapsed = !isCollapsed;
    collapseProgress.set(
        withTiming(isCollapsed ? 1 : 0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
        }),
    );
    for (const listener of listeners) {
        listener();
    }
}

function useSearchSidebarCollapse() {
    const collapsed = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return {collapseProgress, isCollapsed: collapsed, toggleSidebar};
}

export {collapseProgress, toggleSidebar, useSearchSidebarCollapse};
