// Assuming this is in the chat thread component or message handling logic
// File: src/components/Chat/Thread.tsx (or similar)

// The issue likely stems from not properly filtering or handling system messages
// that have been moved, causing the error state to be incorrectly set

// Fix: Ensure moved system messages are properly recognized and don't trigger error state
const handleThreadReply = useCallback(async (message: Message) => {
  try {
    // Check if message is a legitimate moved system message
    if (message.isMovedSystemMessage) {
      // For moved system messages, we should not show error UI
      // Instead, we might want to show a different UI or just ignore the error
      return;
    }
    
    // Existing reply logic
    await api.postThreadReply(message.threadID, replyText);
    // ... rest of success handling
  } catch (error) {
    // Only show error UI for actual errors, not for moved system messages
    if (!message.isMovedSystemMessage) {
      setErrorState(true);
    }
    // Log the error for debugging but don't show to user for moved messages
    console.warn('Thread reply error:', error);
  }
}, [replyText]);

// Alternative fix: In the message processing logic
const processMessage = (message: Message): Message => {
  // ... existing processing logic
  
  // Mark system messages that were moved as legitimate
  if (message.type === 'system' && message.action === 'moved') {
    message.isMovedSystemMessage = true;
  }
  
  return message;
};

// In the UI rendering logic
const renderThreadReply = (message: Message) => {
  // Don't show error UI for moved system messages
  if (message.isMovedSystemMessage) {
    return null; // or render appropriate UI for moved messages
  }
  
  if (errorState) {
    return <ErrorDisplay message="Unexpected error" />;
  }
  
  // ... rest of reply UI
};