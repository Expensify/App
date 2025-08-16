# Backend Changes Required: Fix Whisper Message Link Navigation

## Problem Statement

When users click on links in invite whisper messages, the back button navigation is broken. Users are taken to unexpected locations (Inbox, workspace profile) instead of returning to the original room conversation.

**Root Cause**: The backend-generated whisper message links don't include proper `backTo` parameters to enable correct navigation.

## Backend Changes Required (Auth Repo)

### 1. Identify Whisper Message Generation Location

The issue occurs in the backend code that generates the confirmation whisper message after users choose "Invite to submit expenses". This is likely in:
- `Auth/auth/lib/ReportAction.cpp` (based on the PR discussion)
- Functions that handle `RESOLVE_ACTIONABLE_MENTION_WHISPER` API calls

### 2. Current Problematic Links

The backend currently generates links without navigation context:

```
"Their expense chat": https://new.expensify.com/r/12345
"Workspace member settings": https://new.expensify.com/workspace/abc/members
```

### 3. Required Changes

**Backend should generate links with `backTo` parameters:**

```
"Their expense chat": https://new.expensify.com/r/12345?backTo=/r/currentRoomID
"Workspace member settings": https://new.expensify.com/workspace/abc/members?backTo=/r/currentRoomID
```

### 4. Implementation Details

#### A. Capture Source Context
When processing the `RESOLVE_ACTIONABLE_MENTION_WHISPER` API call:

```cpp
// Pseudo-code for Auth backend changes
string generateWhisperConfirmationMessage(
    const string& reportID,           // Current room where whisper was sent
    const string& inviteeAccountID,   // User being invited
    const string& workspaceID         // Workspace ID
) {
    // Generate URLs with backTo parameter
    string backToParam = "/r/" + reportID;
    string expenseChatURL = "https://new.expensify.com/r/" + inviteeExpenseChatID + "?backTo=" + urlEncode(backToParam);
    string workspaceSettingsURL = "https://new.expensify.com/workspace/" + workspaceID + "/members?backTo=" + urlEncode(backToParam);
    
    // Build whisper message with proper links
    return buildWhisperMessage(expenseChatURL, workspaceSettingsURL);
}
```

#### B. URL Construction Function
Create a helper function for consistent URL building:

```cpp
string buildNavigationURL(const string& basePath, const string& backToRoute) {
    if (backToRoute.empty()) {
        return "https://new.expensify.com" + basePath;
    }
    return "https://new.expensify.com" + basePath + "?backTo=" + urlEncode(backToRoute);
}
```

#### C. Message Template Updates
Update the whisper message templates to use the new URLs:

```cpp
// Before
"Great, you chose to invite them to the workspace! I've invited them and they'll submit expenses in [invitee's workspace chat name](https://new.expensify.com/r/12345)."

// After  
"Great, you chose to invite them to the workspace! I've invited them and they'll submit expenses in [invitee's workspace chat name](https://new.expensify.com/r/12345?backTo=/r/currentRoomID)."
```

### 5. Backend Testing Requirements

#### A. Unit Tests for URL Generation
```cpp
TEST(ReportActionTest, GenerateWhisperLinksWithBackTo) {
    string reportID = "123456";
    string expenseChatID = "789012";
    string workspaceID = "workspace123";
    
    auto whisperMessage = generateWhisperConfirmationMessage(reportID, expenseChatID, workspaceID);
    
    // Verify expense chat link includes backTo
    EXPECT_THAT(whisperMessage, HasSubstr("r/789012?backTo=%2Fr%2F123456"));
    
    // Verify workspace settings link includes backTo
    EXPECT_THAT(whisperMessage, HasSubstr("workspace/workspace123/members?backTo=%2Fr%2F123456"));
}
```

#### B. Integration Tests
```cpp
TEST(ResolveActionableMentionWhisperTest, IncludesNavigationContext) {
    // Setup: Create actionable mention whisper
    auto originalWhisper = createActionableMentionWhisper("room123", {userId});
    
    // Execute: Resolve with INVITE action
    auto result = resolveActionableMentionWhisper(originalWhisper.reportActionID, "invited");
    
    // Verify: Confirmation whisper includes backTo parameters
    auto confirmationWhisper = getLatestWhisperMessage(originalWhisper.reportID);
    EXPECT_THAT(confirmationWhisper.message, HasSubstr("backTo=%2Fr%2Froom123"));
}
```

## Frontend Verification

### How to Test the Fix

1. **Setup**: Open workspace expense chat (e.g., room123)
2. **Trigger**: Mention a non-member user → Select "Invite to submit expenses"
3. **Verify Links**: Confirmation whisper should contain:
   - `https://new.expensify.com/r/expenseChatID?backTo=/r/room123`
   - `https://new.expensify.com/workspace/workspaceID/members?backTo=/r/room123`
4. **Test Navigation**: Click links → use back button → should return to room123

### Frontend Tests (Already Implemented)

The frontend already properly handles `backTo` parameters via the `arePathAndBackToEqual` function in `src/libs/Navigation/helpers/linkTo/index.ts`.

## Implementation Priority

1. **High Priority**: Update whisper message generation to include `backTo` parameters
2. **Medium Priority**: Add comprehensive backend tests
3. **Low Priority**: Consider audit of all other message generation for similar issues

## Files to Modify (Auth Repo)

- `Auth/auth/lib/ReportAction.cpp` - Main whisper generation logic
- Backend test files - Add URL generation tests
- Any utility functions for URL construction

## Risk Assessment

- **Low Risk**: Adding URL parameters is backwards compatible
- **No Breaking Changes**: Frontend already handles `backTo` parameters correctly
- **Immediate Value**: Fixes critical user experience issue

## Success Criteria

- [ ] Whisper message links include proper `backTo` parameters
- [ ] Back navigation returns users to original room
- [ ] Device back button works correctly
- [ ] No regressions in existing navigation flows
- [ ] Backend tests verify URL generation
- [ ] Frontend tests verify link handling

## Notes

- The frontend navigation system already supports `backTo` parameters
- This is a backend-only fix - no frontend changes needed
- The fix addresses the root cause rather than treating symptoms
- Consider similar patterns for other backend-generated navigation links