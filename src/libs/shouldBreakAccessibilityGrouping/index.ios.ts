/**
 * On iOS, VoiceOver groups all children of an accessible parent into a single
 * focus target, preventing individual elements from being focusable. Returning
 * true signals that the parent should set accessible={false} to break this grouping.
 */
export default function shouldBreakAccessibilityGrouping(): boolean {
    return true;
}
