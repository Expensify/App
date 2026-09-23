import useOnyx from '@hooks/useOnyx';

import SearchSidebarActions from '@libs/actions/SearchSidebar';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ViewStyle} from 'react-native';

import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {Platform} from 'react-native';

const SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS = 220;
const SEARCH_SIDEBAR_COLLAPSE_TRANSLATE_X = -8;
const TOGGLE_BUTTON_COLLAPSED_TRANSLATE_X = -10;

const layoutTransitionStyle: ViewStyle =
    Platform.OS === 'web' ? {transition: `width ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease, margin-left ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease`} : {};
const fadeTransitionStyle: ViewStyle =
    Platform.OS === 'web' ? {transition: `opacity ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease, transform ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease`} : {};

let isPeeking = false;

const listeners = new Set<() => void>();

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

function getPeekSnapshot() {
    return isPeeking;
}

function getSearchSidebarWidth(progress: number) {
    return variables.searchSidebarExpandedWidth + (variables.searchSidebarCollapsedWidth - variables.searchSidebarExpandedWidth) * progress;
}

/**
 * The flat navigation bar shares this collapsed state, because it replaced the Spend sidebar that owned it.
 * Keeping one store means one peek state and one persisted flag, rather than two that can disagree.
 */
function getFlatNavigationBarWidth(progress: number) {
    return variables.flatNavigationBarWidth + (variables.flatNavigationBarCollapsedWidth - variables.flatNavigationBarWidth) * progress;
}

function setSearchSidebarCollapsed(collapsed: boolean) {
    isPeeking = false;
    notify();
    SearchSidebarActions.setCollapsed(collapsed);
}

function startPeek(isCollapsed: boolean) {
    if (!isCollapsed || isPeeking) {
        return;
    }

    isPeeking = true;
    notify();
}

function endPeek() {
    if (!isPeeking) {
        return;
    }

    isPeeking = false;
    notify();
}

function useSearchSidebarCollapse() {
    const [searchSidebarNVP] = useOnyx(ONYXKEYS.NVP_SEARCH_SIDEBAR);
    const collapsed = searchSidebarNVP?.isCollapsed ?? false;
    const peeking = useSyncExternalStore(subscribe, getPeekSnapshot, getPeekSnapshot);
    const toggleSidebar = useCallback(() => setSearchSidebarCollapsed(!collapsed), [collapsed]);
    const startSidebarPeek = useCallback(() => startPeek(collapsed), [collapsed]);

    return {
        isCollapsed: collapsed,
        isPeeking: peeking,
        isVisuallyCollapsed: collapsed && !peeking,
        toggleSidebar,
        startPeek: startSidebarPeek,
        endPeek,
    };
}

function useSearchSidebarLayoutWidthStyle() {
    const {isCollapsed: collapsed} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(() => ({...layoutTransitionStyle, height: '100%', width: getSearchSidebarWidth(collapsed ? 1 : 0)}), [collapsed]);
}

function useSearchSidebarVisualWidthStyle() {
    const {isCollapsed: collapsed, isPeeking: peeking} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(() => ({...layoutTransitionStyle, width: getSearchSidebarWidth(collapsed && !peeking ? 1 : 0)}), [collapsed, peeking]);
}

function useSearchSidebarContentOffsetStyle() {
    const {isCollapsed: collapsed} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(() => ({...layoutTransitionStyle, marginLeft: getSearchSidebarWidth(collapsed ? 1 : 0)}), [collapsed]);
}

function useSearchSidebarCollapseFadeStyle() {
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(
        () => ({
            ...fadeTransitionStyle,
            opacity: isVisuallyCollapsed ? 0 : 1,
            transform: [{translateX: isVisuallyCollapsed ? SEARCH_SIDEBAR_COLLAPSE_TRANSLATE_X : 0}],
        }),
        [isVisuallyCollapsed],
    );
}

function useSearchSidebarToggleButtonStyle() {
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(
        () => ({
            ...fadeTransitionStyle,
            transform: [{translateX: isVisuallyCollapsed ? TOGGLE_BUTTON_COLLAPSED_TRANSLATE_X : 0}],
        }),
        [isVisuallyCollapsed],
    );
}

// The account avatar's box is wider than a row's icon, so collapsed it would sit right of the rail's centre.
// Sliding it by half that difference lines it up, and the transform animates where a padding change would jump.
const ACCOUNT_AVATAR_COLLAPSED_TRANSLATE_X = -(variables.avatarSizeSmall - variables.iconSizeNormal) / 2;

function useFlatNavigationBarAccountAvatarStyle() {
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(() => ({...fadeTransitionStyle, transform: [{translateX: isVisuallyCollapsed ? ACCOUNT_AVATAR_COLLAPSED_TRANSLATE_X : 0}]}), [isVisuallyCollapsed]);
}

/** Layout space the bar reserves. Peeking overlays the content rather than pushing it, so this ignores the peek. */
function useFlatNavigationBarLayoutWidthStyle() {
    const {isCollapsed: collapsed} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(() => ({...layoutTransitionStyle, height: '100%', width: getFlatNavigationBarWidth(collapsed ? 1 : 0)}), [collapsed]);
}

/** What the bar actually draws, which widens back out while the pointer peeks at it. */
function useFlatNavigationBarVisualWidthStyle() {
    const {isCollapsed: collapsed, isPeeking: peeking} = useSearchSidebarCollapse();

    return useMemo<ViewStyle>(() => ({...layoutTransitionStyle, width: getFlatNavigationBarWidth(collapsed && !peeking ? 1 : 0)}), [collapsed, peeking]);
}

export {
    SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS,
    getFlatNavigationBarWidth,
    useFlatNavigationBarAccountAvatarStyle,
    useFlatNavigationBarLayoutWidthStyle,
    useFlatNavigationBarVisualWidthStyle,
    useSearchSidebarCollapse,
    useSearchSidebarLayoutWidthStyle,
    useSearchSidebarVisualWidthStyle,
    useSearchSidebarContentOffsetStyle,
    useSearchSidebarCollapseFadeStyle,
    useSearchSidebarToggleButtonStyle,
};
