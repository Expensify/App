// lib/Report/Report.tsx
// ... existing imports ...
import {
    getReportActionMessage,
    getReportActionMessageText,
    getReportActionHTML,
    isReportActionMessageMoved,
    isReportActionSystem,
} from './ReportUtils';

// ... existing code ...

// In the ReplyInThread component or its parent:
const handleReplyInThread = useCallback(() => {
    // ... existing validation logic ...
    
    if (isReportActionMessageMoved(reportAction)) {
        // Moved system messages should not show an error when replying in thread
        // They are legitimate and should be handled gracefully
        return;
    }
    
    // ... rest of the reply logic ...
}, [reportAction]);

// In ReportUtils.ts
/**
 * Checks if a report action is a system message that was moved
 * @param reportAction - The report action to check
 * @returns true if the action is a moved system message
 */
function isReportActionMessageMoved(reportAction: ReportAction): boolean {
    if (!reportAction || !isReportActionSystem(reportAction)) {
        return false;
    }
    
    const message = getReportActionMessage(reportAction);
    if (!message || !message.html) {
        return false;
    }
    
    // Check for moved message indicators in the HTML
    // This could be a specific class, data attribute, or message pattern
    return message.html.includes('moved') || 
           message.html.includes('data-moved="true"') ||
           message.html.includes('data-type="moved"');
}

// ... existing exports ...