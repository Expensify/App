// Assuming the relevant file is something like `src/components/Avatar.js` or `src/components/ThreadSummary.js`
// Based on common patterns in the Expensify/App codebase

import React from 'react';
import { View, Image } from 'react-native';
import _ from 'underscore';
import withLocalize from './withLocalize';
import compose from '../libs/compose';
import * as UserUtils from '../libs/UserUtils';
import CONST from '../CONST';

// Copilot user ID constant
const COPILLOT_USER_ID = 'copilot';

function Avatar({ avatar, login, isCopilot, style }) {
  // If Copilot is acting on behalf of another account, we should show the Copilot avatar
  // rather than the original user's avatar
  const effectiveAvatar = isCopilot 
    ? UserUtils.getAvatar(UserUtils.getCopilotAvatar(), '') 
    : avatar;

  return (
    <View style={style}>
      <Image
        source={{ uri: effectiveAvatar }}
        style={style}
        resizeMode="cover"
      />
    </View>
  );
}

// In the ThreadSummary component where avatars are rendered:
// Find where the avatar is rendered and ensure isCopilot prop is passed correctly

function ThreadSummary({ report, accountID, isCopilot }) {
  // Determine if we should show Copilot avatar
  // When Copilot is acting on behalf of another account, isCopilot should be true
  // and we should override the avatar to show Copilot's avatar
  
  const copilotAvatar = UserUtils.getCopilotAvatar();
  const effectiveAvatar = isCopilot 
    ? copilotAvatar 
    : report.avatar || UserUtils.getAvatar(accountID, report.login);

  return (
    <View style={styles.container}>
      <Avatar 
        avatar={effectiveAvatar} 
        isCopilot={isCopilot}
        style={styles.avatar}
      />
      {/* other thread summary content */}
    </View>
  );
}

// The key fix is ensuring isCopilot is properly determined and passed down
// In the parent component where ThreadSummary is used:
// const isCopilot = report.ownerAccountID !== accountID && UserUtils.isCopilot();

// Alternative approach if the report has a specific field indicating Copilot action:
// const isCopilot = report.isCopilotAction || false;

export default compose(
  withLocalize,
)(ThreadSummary);