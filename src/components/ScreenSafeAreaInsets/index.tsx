import type ChildrenProps from '@src/types/utils/ChildrenProps';

/** Only a foldable iPhone gives its screens a safe area the window doesn't have (its vertical bar), so elsewhere the window's insets are the screen's. */
function ScreenSafeAreaInsets({children}: ChildrenProps) {
    return children;
}

/** Elsewhere the screen's insets are already the window's, so a modal keeps them. */
function WindowSafeAreaInsets({children}: ChildrenProps) {
    return children;
}

export default ScreenSafeAreaInsets;
export {WindowSafeAreaInsets};
