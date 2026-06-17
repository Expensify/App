// Update the logic to check if the newest action is visible instead of just the unread marker
const newestActionVisible = isInverted ? newestActionIndex >= minIndex : newestActionIndex <= maxIndex;

if (newestActionVisible && hasUnreadMarkerReportAction) {
    setIsFloatingMessageCounterVisible(true);
}