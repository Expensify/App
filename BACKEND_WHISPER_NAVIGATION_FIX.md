# Backend Fix for Invite Whisper Navigation Issue

## Problem Description

When users click on links in invite system messages (whisper messages) generated after resolving an actionable mention whisper, the back button navigation doesn't work correctly. Users land on unexpected pages instead of returning to the original chat where they triggered the whisper.

**Issue Details:**
- **"Their expense chat" link**: Back button takes users to Inbox instead of original chat
- **"Workspace member settings" link**: Back button takes users to workspace profile/workspaces section instead of original chat
- **Device back button**: Also doesn't work properly

## Root Cause

The backend (Auth repository) generates links in whisper confirmation messages without preserving navigation context. The links don't include proper `backTo` parameters that would allow users to return to the originating chat.

## Frontend Changes Made

1. **Updated `ResolveActionableMentionWhisperParams`** to include `currentReportID`:
   ```typescript
   type ResolveActionableMentionWhisperParams = {
       reportActionID: string;
       resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>;
       /** Current report ID for navigation context - used to generate proper backTo parameters in whisper links */
       currentReportID: string;
   };
   ```

2. **Updated frontend API call** to pass current report ID:
   ```typescript
   const parameters: ResolveActionableMentionWhisperParams = {
       reportActionID: reportAction.reportActionID,
       resolution,
       currentReportID: reportID, // Added for navigation context
   };
   ```

3. **Added test** to verify the API call includes the `currentReportID` parameter.

## Required Backend Implementation (Auth Repository)

### 1. Update API Handler

The `ResolveActionableMentionWhisper` API handler must be updated to:

1. **Accept the new `currentReportID` parameter**
2. **Generate proper navigation URLs** using the current report ID as the `backTo` parameter

### 2. Link Generation Logic

When generating the confirmation whisper message, the backend should construct links with proper `backTo` parameters:

**Before (problematic):**
```
"Their expense chat": /r/[memberWorkspaceChatID]
"Workspace member settings": /workspaces/[policyID]/members
```

**After (fixed):**
```
"Their expense chat": /r/[memberWorkspaceChatID]?backTo=/r/[currentReportID]
"Workspace member settings": /workspaces/[policyID]/members?backTo=/r/[currentReportID]
```

### 3. Implementation Steps

1. **Update PHP API handler** to accept `currentReportID` parameter:
   ```php
   $currentReportID = $request->getParam('currentReportID');
   ```

2. **Modify whisper message generation** to include `backTo` parameters:
   ```php
   $backToParam = '/r/' . $currentReportID;
   $memberWorkspaceChatLink = '/r/' . $memberWorkspaceChatID . '?backTo=' . urlencode($backToParam);
   $workspaceSettingsLink = '/workspaces/' . $policyID . '/members?backTo=' . urlencode($backToParam);
   ```

3. **Update whisper message template** to use the new links with navigation context.

### 4. Backend Testing Requirements

Add tests to verify:

1. **Parameter validation**: `currentReportID` is properly received and validated
2. **Link generation**: Generated links include correct `backTo` parameters
3. **URL encoding**: `backTo` parameters are properly URL encoded
4. **Edge cases**: Handle missing or invalid `currentReportID`

**Example test cases:**
```php
// Test 1: Verify currentReportID is included in whisper links
public function testWhisperLinksIncludeNavigationContext() {
    $currentReportID = 'test-report-123';
    $resolution = 'invited';
    
    $whisperMessage = generateInviteWhisperMessage($currentReportID, $resolution, $memberData);
    
    $this->assertStringContains('backTo=/r/' . $currentReportID, $whisperMessage);
}

// Test 2: Verify proper URL encoding
public function testBackToParameterIsProperlyEncoded() {
    $currentReportID = 'test-report-with-special-chars';
    $whisperMessage = generateInviteWhisperMessage($currentReportID, 'invited', $memberData);
    
    $this->assertStringContains(urlencode('/r/' . $currentReportID), $whisperMessage);
}
```

### 5. Validation

After implementation, verify that:

1. **Back button navigation works**: Users return to original chat when using back button
2. **Device back button works**: Native back button behavior is preserved
3. **Deep links work**: Links can be shared and opened correctly
4. **No regressions**: Existing whisper functionality continues to work

## Files to Modify

### Frontend (App repository) - COMPLETED ✅
- `src/libs/API/parameters/ResolveActionableMentionWhisperParams.ts`
- `src/libs/actions/Report.ts`
- `tests/actions/ReportTest.ts`

### Backend (Auth repository) - PENDING ⏳
- API handler for `ResolveActionableMentionWhisper`
- Whisper message generation logic
- Backend tests for link generation

## Success Criteria

- [ ] Users can click whisper links and return to original chat using back button
- [ ] Device back button works correctly 
- [ ] Links include proper `backTo` parameters
- [ ] Backend tests verify correct link generation
- [ ] No existing functionality is broken

## Notes

- This is a **backend-only solution** as requested
- Frontend changes are minimal and only pass navigation context
- All frontend/markdown changes from previous implementations should be reverted
- Focus on reusing existing test patterns rather than creating new test methods