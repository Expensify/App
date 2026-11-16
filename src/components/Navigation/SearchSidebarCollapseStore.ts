import useOnyx from '@hooks/useOnyx';

import SearchSidebarActions from '@libs/actions/SearchSidebar';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useSyncExternalStore} from 'react';
import {Platform} from 'react-native';

const SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS = 220;
const SEARCH_SIDEBAR_COLLAPSE_TRANSLATE_X = -8;
const TOGGLE_BUTTON_COLLAPSED_TRANSLATE_X = -10;

/**
 * The surfaces that share the collapsed flag. They collapse together, but each one peeks on its own: hovering the
 * flat navigation bar must not widen the Spend sidebar next to it, and the other way round.
 */
const COLLAPSE_SURFACE = {
    NAVIGATION_BAR: 'navigationBar',
    SEARCH_SIDEBAR: 'searchSidebar',
} as const;

type CollapseSurface = ValueOf<typeof COLLAPSE_SURFACE>;

const layoutTransitionStyle: ViewStyle =
    Platform.OS === 'web' ? {transition: `width ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease, margin-left ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease`} : {};
const fadeTransitionStyle: ViewStyle =
    Platform.OS === 'web' ? {transition: `opacity ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease, transform ${SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS}ms ease`} : {};

// The account avatar's box is wider than a row's icon, so collapsed it would sit right of the icon column.
// Sliding it by half that difference lines it up, and a transform animates where a padding change would jump.
const ACCOUNT_AVATAR_COLLAPSED_TRANSLATE_X = -(variables.avatarSizeSmall - variables.iconSizeNormal) / 2;

let peekingSurface: CollapseSurface | null = null;

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

function getSearchSidebarWidth(progress: number) {
    return variables.searchSidebarExpandedWidth + (variables.searchSidebarCollapsedWidth - variables.searchSidebarExpandedWidth) * progress;
}

function setSearchSidebarCollapsed(collapsed: boolean) {
    peekingSurface = null;
    notify();
    SearchSidebarActions.setCollapsed(collapsed);
}

function startPeek(surface: CollapseSurface, isCollapsed: boolean) {
    if (!isCollapsed || peekingSurface !== null) {
        return;
    }

    peekingSurface = surface;
    notify();
}

function endPeek(surface: CollapseSurface) {
    if (peekingSurface !== surface) {
        return;
    }

    peekingSurface = null;
    notify();
}

const isSurfacePeekingSnapshots: Record<CollapseSurface, () => boolean> = {
    [COLLAPSE_SURFACE.NAVIGATION_BAR]: () => peekingSurface === COLLAPSE_SURFACE.NAVIGATION_BAR,
    [COLLAPSE_SURFACE.SEARCH_SIDEBAR]: () => peekingSurface === COLLAPSE_SURFACE.SEARCH_SIDEBAR,
};

const endPeekBySurface: Record<CollapseSurface, () => void> = {
    [COLLAPSE_SURFACE.NAVIGATION_BAR]: () => endPeek(COLLAPSE_SURFACE.NAVIGATION_BAR),
    [COLLAPSE_SURFACE.SEARCH_SIDEBAR]: () => endPeek(COLLAPSE_SURFACE.SEARCH_SIDEBAR),
};

function useSearchSidebarCollapse(surface: CollapseSurface = COLLAPSE_SURFACE.SEARCH_SIDEBAR) {
    const [searchSidebarNVP] = useOnyx(ONYXKEYS.NVP_SEARCH_SIDEBAR);
    const collapsed = searchSidebarNVP?.isCollapsed ?? false;
    const isSurfacePeekingSnapshot = isSurfacePeekingSnapshots[surface];
    const peeking = useSyncExternalStore(subscribe, isSurfacePeekingSnapshot, isSurfacePeekingSnapshot);
    const toggleSidebar = () => setSearchSidebarCollapsed(!collapsed);
    const startSurfacePeek = () => startPeek(surface, collapsed);

    return {
        isCollapsed: collapsed,
        isPeeking: peeking,
        isVisuallyCollapsed: collapsed && !peeking,
        toggleSidebar,
        startPeek: startSurfacePeek,
        endPeek: endPeekBySurface[surface],
    };
}

function useSearchSidebarLayoutWidthStyle() {
    const {isCollapsed: collapsed} = useSearchSidebarCollapse();

    return {...layoutTransitionStyle, height: '100%', width: getSearchSidebarWidth(collapsed ? 1 : 0)};
}

function useSearchSidebarVisualWidthStyle() {
    const {isCollapsed: collapsed, isPeeking: peeking} = useSearchSidebarCollapse();

    return {...layoutTransitionStyle, width: getSearchSidebarWidth(collapsed && !peeking ? 1 : 0)};
}

function useSearchSidebarContentOffsetStyle() {
    const {isCollapsed: collapsed} = useSearchSidebarCollapse();

    return {...layoutTransitionStyle, marginLeft: getSearchSidebarWidth(collapsed ? 1 : 0)};
}

/** Fades a label out and nudges it toward the icon column while its surface is visually collapsed. */
function getCollapseFadeStyle(isVisuallyCollapsed: boolean): ViewStyle {
    return {
        ...fadeTransitionStyle,
        opacity: isVisuallyCollapsed ? 0 : 1,
        transform: [{translateX: isVisuallyCollapsed ? SEARCH_SIDEBAR_COLLAPSE_TRANSLATE_X : 0}],
    };
}

function useSearchSidebarCollapseFadeStyle() {
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    return getCollapseFadeStyle(isVisuallyCollapsed);
}

function useSearchSidebarToggleButtonStyle() {
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    return {
        ...fadeTransitionStyle,
        transform: [{translateX: isVisuallyCollapsed ? TOGGLE_BUTTON_COLLAPSED_TRANSLATE_X : 0}],
    };
}

/**
 * Layout space the flat navigation bar reserves. Peeking overlays the content rather than pushing it, so this
 * ignores the peek.
 */
function getFlatNavigationBarLayoutWidth(isCollapsed: boolean): number {
    return isCollapsed ? variables.flatNavigationBarCollapsedWidth : variables.flatNavigationBarWidth;
}

/** The layout box the flat navigation bar reserves, which eases with the bar so the content beside it follows. */
function getFlatNavigationBarLayoutWidthStyle(isCollapsed: boolean): ViewStyle {
    return {...layoutTransitionStyle, width: getFlatNavigationBarLayoutWidth(isCollapsed)};
}

/** What the flat navigation bar draws, which widens back out while the pointer peeks at it. */
function getFlatNavigationBarVisualWidthStyle(isVisuallyCollapsed: boolean): ViewStyle {
    return {...layoutTransitionStyle, width: getFlatNavigationBarLayoutWidth(isVisuallyCollapsed)};
}

/** The shadow only reads while a collapsed bar peeks over the content. Expanded, the bar has nothing to sit above. */
function getFlatNavigationBarPeekShadowStyle(isPeeking: boolean): ViewStyle {
    return {...fadeTransitionStyle, opacity: isPeeking ? 1 : 0};
}

function getFlatNavigationBarAccountAvatarStyle(isVisuallyCollapsed: boolean): ViewStyle {
    return {...fadeTransitionStyle, transform: [{translateX: isVisuallyCollapsed ? ACCOUNT_AVATAR_COLLAPSED_TRANSLATE_X : 0}]};
}

export {
    COLLAPSE_SURFACE,
    SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS,
    layoutTransitionStyle,
    getCollapseFadeStyle,
    getFlatNavigationBarAccountAvatarStyle,
    getFlatNavigationBarLayoutWidth,
    getFlatNavigationBarLayoutWidthStyle,
    getFlatNavigationBarPeekShadowStyle,
    getFlatNavigationBarVisualWidthStyle,
    useSearchSidebarCollapse,
    useSearchSidebarLayoutWidthStyle,
    useSearchSidebarVisualWidthStyle,
    useSearchSidebarContentOffsetStyle,
    useSearchSidebarCollapseFadeStyle,
    useSearchSidebarToggleButtonStyle,
};
