# Pure Backend Solution: Fix Invite Whisper Navigation Issue

## Problem Description

When users click on links in invite system messages (whisper confirmation messages), the back button navigation doesn't work correctly. Users land on unexpected pages instead of returning to the original chat where they triggered the whisper.

**Issue Details:**
- **"Their expense chat" link**: Back button takes users to Inbox instead of original chat
- **"Workspace member settings" link**: Back button takes users to workspace profile/workspaces section instead of original chat
- **Device back button**: Also doesn't work properly

## Root Cause

The backend (Auth repository) generates links in whisper confirmation messages without navigation context. The links don't include `backTo` parameters that would allow users to return to the originating chat.

## Pure Backend Solution

**Key Insight**: The backend already receives the `reportActionID` parameter and can determine the originating report from that action ID without needing any frontend changes.

### Implementation Approach

1. **Use existing `reportActionID` parameter** - no frontend changes needed
2. **Backend looks up which report the action belongs to** 
3. **Generate links with proper `backTo` parameters** using the originating report ID

### Backend Implementation (Auth Repository)

#### 1. Update `ResolveActionableMentionWhisper` API Handler

```php
// In the ResolveActionableMentionWhisper API handler
public function resolveActionableMentionWhisper($request) {
    $reportActionID = $request->getParam('reportActionID');
    $resolution = $request->getParam('resolution');
    
    // NEW: Determine the originating report from the reportActionID
    $originatingReportID = $this->getReportIDFromReportAction($reportActionID);
    
    if ($resolution === 'invited') {
        // Generate confirmation whisper with proper navigation context
        $whisperMessage = $this->generateInviteConfirmationWhisper(
            $originatingReportID, // Pass originating report for backTo links
            $memberData,
            $policyData
        );
    }
}

private function getReportIDFromReportAction($reportActionID) {
    // Look up which report this action belongs to
    $query = "SELECT reportID FROM report_actions WHERE id = ?";
    return $this->db->fetchValue($query, [$reportActionID]);
}
```

#### 2. Update Link Generation

```php
private function generateInviteConfirmationWhisper($originatingReportID, $memberData, $policyData) {
    $backToParam = '/r/' . $originatingReportID;
    
    // Generate links with proper backTo parameters
    $memberWorkspaceChatLink = '/r/' . $memberData['workspaceChatID'] . 
                              '?backTo=' . urlencode($backToParam);
    
    $workspaceSettingsLink = '/workspaces/' . $policyData['policyID'] . '/members' . 
                            '?backTo=' . urlencode($backToParam);
    
    return "Great, you chose to invite them to the workspace! I've invited them and they'll submit expenses in " .
           "[{$memberData['workspaceChatName']}]({$memberWorkspaceChatLink}). " .
           "If you need to make them an admin, you can do that in the " .
           "[workspace member settings]({$workspaceSettingsLink}).";
}
```

#### 3. Backend Testing

Add tests to verify the solution works:

```php
public function testWhisperLinksIncludeBackToParameter() {
    // Mock report action that belongs to a specific report
    $reportActionID = 'test-action-123';
    $originatingReportID = 'test-report-456';
    
    // Mock the database lookup
    $this->mockDatabase->expects($this->once())
        ->method('fetchValue')
        ->with($this->stringContains('SELECT reportID FROM report_actions'))
        ->willReturn($originatingReportID);
    
    // Call the API
    $result = $this->api->resolveActionableMentionWhisper([
        'reportActionID' => $reportActionID,
        'resolution' => 'invited'
    ]);
    
    // Verify the generated links include proper backTo parameters
    $this->assertStringContains('backTo=/r/' . $originatingReportID, $result['whisperMessage']);
}

public function testBackToParameterIsProperlyURLEncoded() {
    $reportActionID = 'test-action-123';
    $originatingReportID = 'test-report-with-special-chars';
    
    $this->mockDatabase->expects($this->once())
        ->method('fetchValue')
        ->willReturn($originatingReportID);
    
    $result = $this->api->resolveActionableMentionWhisper([
        'reportActionID' => $reportActionID,
        'resolution' => 'invited'
    ]);
    
    // Verify URL encoding
    $expectedBackTo = urlencode('/r/' . $originatingReportID);
    $this->assertStringContains($expectedBackTo, $result['whisperMessage']);
}
```

## Advantages of This Approach

1. **Zero frontend changes** - uses existing API contract
2. **Leverages existing data** - reportActionID already tells us the originating report
3. **Backward compatible** - no breaking changes to API
4. **Simple implementation** - just add a database lookup and modify link generation
5. **Reuses existing test patterns** - follows Auth repo testing conventions

## Files to Modify (Auth Repository Only)

- `api/ResolveActionableMentionWhisper.php` - API handler
- `tests/ResolveActionableMentionWhisperTest.php` - Add navigation context tests
- Any whisper message generation utility functions

## Success Criteria

- [ ] Users can click whisper links and return to original chat using back button
- [ ] Device back button works correctly
- [ ] Links include proper `backTo=/r/[originatingReportID]` parameters  
- [ ] Backend tests verify correct link generation
- [ ] No frontend changes required
- [ ] No breaking changes to existing API

## Database Schema Note

This solution assumes the Auth repository can look up which report a `reportActionID` belongs to. If the database structure is different, adjust the lookup query accordingly.

The key principle remains: **use the reportActionID to determine the originating report, then use that for backTo parameters**.