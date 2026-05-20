import {useSyncExternalStore} from 'react';
import {Easing, makeMutable, withTiming} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

const collapseProgress: SharedValue<number> = makeMutable(0);
const peekProgress: SharedValue<number> = makeMutable(0);
let isCollapsed = false;
let isPeeking = false;
const listeners = new Set<() => void>();

const ANIMATION = {duration: 220, easing: Easing.out(Easing.cubic)};

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function notify() {
    for (const listener of listeners) {
        listener();
    }
}

function getCollapseSnapshot() {
    return isCollapsed;
}

function getPeekSnapshot() {
    return isPeeking;
}

function toggleSidebar() {
    isCollapsed = !isCollapsed;
    collapseProgress.set(withTiming(isCollapsed ? 1 : 0, ANIMATION));

    if (!isCollapsed && isPeeking) {
        isPeeking = false;
        peekProgress.set(0);
    }

    notify();
}

function commitEndPeek() {
    if (!isPeeking) {
        return;
    }
    isPeeking = false;
    notify();
}

function startPeek() {
    if (!isCollapsed || isPeeking) {
        return;
    }
    isPeeking = true;
    notify();
    peekProgress.set(withTiming(1, ANIMATION));
}

function endPeek() {
    if (!isPeeking) {
        return;
    }
    peekProgress.set(
        withTiming(0, ANIMATION, (finished) => {
            'worklet';

            if (finished) {
                scheduleOnRN(commitEndPeek);
            }
        }),
    );
}

function useSearchSidebarCollapse() {
    const collapsed = useSyncExternalStore(subscribe, getCollapseSnapshot, getCollapseSnapshot);
    const peeking = useSyncExternalStore(subscribe, getPeekSnapshot, getPeekSnapshot);
    return {
        collapseProgress,
        peekProgress,
        isCollapsed: collapsed,
        isPeeking: peeking,
        isVisuallyCollapsed: collapsed && !peeking,
        toggleSidebar,
        startPeek,
        endPeek,
    };
}

export {collapseProgress, peekProgress, toggleSidebar, startPeek, endPeek, useSearchSidebarCollapse};
