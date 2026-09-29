type ShouldFollowActionBadgeTargetParams = {
    /** Whether the app is running in production, where this auto-scroll behavior is gated off */
    isProduction: boolean;

    /** The report action the badge currently targets (the oldest preview still requiring action) */
    actionTargetReportActionID: string | undefined;

    /** The report action the badge targeted on the previous render */
    prevActionTargetReportActionID: string | undefined;

    /** Index of the current target in the chronological list, or -1 when it is not rendered */
    actionBadgeTargetIndex: number;

    /** Index of the previous target in the chronological list, or -1 when it is not rendered */
    prevActionBadgeTargetIndex: number;
};

/**
 * Decide whether to auto-scroll the report list to follow the action badge once its current target is resolved.
 *
 * The list is chronological: index 0 is the oldest action and higher indexes are newer actions. The badge always targets the
 * oldest actionable preview, so resolving it advances the target to a newer preview (a strictly higher index).
 * We only follow when the target moves to a higher index, so we scroll downward to the next actionable preview and never jump
 * upward/backward (e.g. when older actions are loaded in via pagination).
 */
function shouldFollowActionBadgeTarget({
    isProduction,
    actionTargetReportActionID,
    prevActionTargetReportActionID,
    actionBadgeTargetIndex,
    prevActionBadgeTargetIndex,
}: ShouldFollowActionBadgeTargetParams): boolean {
    if (isProduction || !actionTargetReportActionID || !prevActionTargetReportActionID || actionTargetReportActionID === prevActionTargetReportActionID || actionBadgeTargetIndex < 0) {
        return false;
    }
    return prevActionBadgeTargetIndex >= 0 && actionBadgeTargetIndex > prevActionBadgeTargetIndex;
}

export default shouldFollowActionBadgeTarget;
