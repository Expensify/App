## Proposal

### Please re-state the problem that we are trying to solve in this issue.

In the Left Hand Navigation (LHN), workspace expense rooms (policy expense chats) have noticeably less horizontal spacing than non-workspace rooms when in Focus/Compact mode. The text content appears 4px closer to the avatar than in standard chat rooms.

### What is the root cause of that problem?

The spacing inconsistency occurs due to different margin values applied to avatars based on their type:

1. **Single avatars** in `OptionRowLHN.tsx` are given an explicit `styles.mr3` (12px margin-right) via `singleAvatarContainerStyle`:
   https://github.com/Expensify/App/blob/e54cfd4428ac49ea5452c1e88c8938c0b1248d0a/src/components/LHNOptionsList/OptionRowLHN.tsx#L274

2. **Subscript avatars** (used for workspace expense rooms) use `StyleUtils.getContainerStyles(size)` which returns `styles.emptyAvatarMarginSmall` (8px margin-right) for `CONST.AVATAR_SIZE.SMALL`:
   https://github.com/Expensify/App/blob/e54cfd4428ac49ea5452c1e88c8938c0b1248d0a/src/components/ReportActionAvatars/ReportActionAvatar.tsx#L194
   https://github.com/Expensify/App/blob/e54cfd4428ac49ea5452c1e88c8938c0b1248d0a/src/styles/index.ts#L2416-L2418

The 4px difference (`12px - 8px = 4px`) causes the visual inconsistency. In focus mode, avatar size is set to `SMALL` (line 268 of OptionRowLHN.tsx), which triggers this reduced margin for subscript avatars.

### What changes do you think we should make in order to solve the problem?

Add 4px margin-left (`styles.ml1`) to the content container specifically for policy expense chats in focus mode to compensate for the reduced avatar margin. This keeps the text alignment consistent across all room types.

Modify line 127 of `/src/components/LHNOptionsList/OptionRowLHN.tsx`:

**Current code:**
```typescript
const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
```

**Proposed code:**
```typescript
const contentContainerStyles =
    isInFocusMode && optionItem?.isPolicyExpenseChat
        ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles(), styles.ml1]
        : isInFocusMode
          ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()]
          : [styles.flex1];
```

**Why this approach:**
- **Minimal change**: Only affects the text positioning for the specific case causing the issue
- **Targeted fix**: Doesn't modify global avatar styles that could affect other components
- **Uses existing patterns**: Similar conditional styling based on report type is already used elsewhere in the component (e.g., line 289-298 for `shouldUseFullTitle`)
- **Safe**: Only adds margin when both conditions are true (focus mode AND policy expense chat)

### What alternative solutions did you explore? (Optional)

1. **Modifying `emptyAvatarMarginSmall` to 12px**: This would affect all components using small subscript avatars globally, potentially causing unintended layout changes elsewhere.

2. **Adding a new prop to ReportActionAvatars for subscript container styles**: More flexible but overly complex for this specific fix.

3. **Using `shouldShowSubscript` instead of `isPolicyExpenseChat`**: While more comprehensive, this could affect other report types that may have intentionally different spacing. The issue specifically reports workspace expense rooms, so targeting `isPolicyExpenseChat` is appropriate.
