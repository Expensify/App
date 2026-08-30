// Assuming this is in a thread summary component like ThreadSummary.tsx or similar
// The fix would be in the avatar rendering logic

import React from 'react';
import { Avatar } from './Avatar'; // or similar import path

interface ThreadSummaryProps {
  actorAccountID: number;
  actionAccountID: number;
  isCopilotAction: boolean;
  // ...other props
}

export const ThreadSummary: React.FC<ThreadSummaryProps> = ({
  actorAccountID,
  actionAccountID,
  isCopilotAction,
}) => {
  // Determine which avatar to show:
  // If Copilot is acting on behalf of another account, show Copilot's avatar
  // Otherwise, show the actor's avatar
  const showCopilotAvatar = isCopilotAction;
  const avatarAccountID = showCopilotAvatar ? 0 : actorAccountID; // 0 or specific Copilot account ID
  
  return (
    <div className="thread-summary">
      <Avatar
        accountID={avatarAccountID}
        // ...other avatar props
      />
      {/* ...rest of component */}
    </div>
  );
};

// Alternative approach if using a more specific component structure:
// In the component that renders the avatar in thread summary:

const ThreadSummaryAvatar = ({
  actorAccountID,
  isCopilotAction,
  copilotAccountID = 0, // default Copilot account ID
}: {
  actorAccountID: number;
  isCopilotAction: boolean;
  copilotAccountID?: number;
}) => {
  // Show Copilot avatar when acting on behalf of another account
  const avatarAccountID = isCopilotAction ? copilotAccountID : actorAccountID;
  
  return <Avatar accountID={avatarAccountID} />;
};

// Or if the logic is in a utility function:
export const getAvatarAccountID = (
  actorAccountID: number,
  actionAccountID: number,
  isCopilotAction: boolean
): number => {
  // When Copilot acts on behalf of another account, show Copilot's avatar
  // Otherwise show the actor's avatar
  return isCopilotAction ? 0 : actorAccountID; // 0 represents Copilot
};