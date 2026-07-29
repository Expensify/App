/**
 * On non-iOS platforms, accessible elements don't group children in a way
 * that prevents individual focus, so we don't need to break grouping.
 */
export default function shouldBreakAccessibilityGrouping(): boolean {
    return false;
}
