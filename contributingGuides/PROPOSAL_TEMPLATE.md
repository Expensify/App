## Proposal

### Please re-state the problem that we are trying to solve in this issue.

Users viewing receipts in the Transaction Receipt Modal can currently rotate receipts but cannot crop them. When receipts contain unwanted areas (like table surfaces, other items, or excessive whitespace), users have no way to remove these areas before saving. This results in lower quality receipt images that may affect OCR accuracy and visual clarity.

### What is the root cause of that problem?

The root cause is that the receipt modal UI only exposes rotation functionality through the header's rotate button. There is no crop interface that allows users to:
1. Visually select the area they want to keep
2. Interactively adjust crop boundaries
3. Preview the cropped result before saving

The underlying `cropOrRotateImage` utility already supports cropping operations (it accepts crop actions with originX, originY, width, and height), but this functionality is not exposed in the UI.

### What changes do you think we should make in order to solve the problem?
<!-- DO NOT POST CODE DIFFS -->

1. **Add action buttons footer**: Create a footer section below the receipt image with three buttons: "Rotate", "Crop", and "Replace". These buttons should be visible when viewing receipts (similar to how the rotate button currently appears in the header, but moved to a footer for better UX).

2. **Implement crop mode state**: When the "Crop" button is clicked, enter a crop mode that:
   - Hides the three action buttons (Rotate, Crop, Replace)
   - Shows two buttons instead: "Cancel" (to exit crop mode) and "Save" (to apply the crop)
   - Displays a draggable border overlay around the receipt image

3. **Create draggable crop border component**: Build a `ReceiptCropView` component that:
   - Renders a rectangular border with four corner handles (small circular indicators)
   - Allows dragging each corner independently to adjust the crop area
   - Maintains the crop rectangle bounds within the image boundaries
   - Provides visual feedback (e.g., green border color) to indicate the active crop area
   - Calculates the crop coordinates (originX, originY, width, height) relative to the original image dimensions

4. **Integrate crop functionality**: 
   - When "Save" is clicked in crop mode, calculate the crop parameters based on the current border position
   - Use the existing `cropOrRotateImage` function with the crop action
   - Update the receipt using the same pattern as the rotate functionality (either `setMoneyRequestReceipt` for draft transactions or `replaceReceipt` for saved transactions)
   - Exit crop mode and return to normal view after successful crop

5. **Update header behavior**: 
   - Remove the rotate button from the header (it will be in the footer)
   - Keep Download and Delete in the three-dots menu in the header as specified
   - Ensure the header remains clean with only essential actions

6. **Handle edge cases**:
   - Disable crop mode for e-receipts (similar to how rotate is disabled)
   - Ensure crop mode is only available for image files (not PDFs or other formats)
   - Prevent crop when receipt is being scanned or has missing smartscan fields
   - Handle image loading states appropriately

The implementation will follow the existing patterns in the codebase:
- Use React Native Gesture Handler for drag interactions (similar to `AvatarCropModal`)
- Leverage the existing `cropOrRotateImage` utility
- Follow the same transaction update patterns used by the rotate feature
- Maintain consistency with the current modal structure and styling

### What alternative solutions did you explore? (Optional)

1. **Separate crop modal**: Considered opening a dedicated crop modal (like `AvatarCropModal`), but this would require an extra navigation step and break the flow. Inline cropping provides a smoother UX.

2. **Fixed aspect ratio cropping**: Considered enforcing a fixed aspect ratio, but receipts vary significantly in dimensions, so free-form cropping is more flexible.

3. **Crop in header menu**: Considered adding crop to the three-dots menu, but having it as a primary action button in the footer makes it more discoverable and accessible.

4. **Using existing AvatarCropModal**: The `AvatarCropModal` component uses a circular mask and zoom slider, which is optimized for avatars. For receipts, we need a rectangular crop with corner handles, so a new component is more appropriate.

**Reminder:** Please use plain English, be brief and avoid jargon. Feel free to use images, charts or pseudo-code if necessary. Do not post large multi-line diffs or write walls of text. Do not create PRs unless you have been hired for this job.

<!---
ATTN: Contributor+

You are the first line of defense in making sure every proposal has a clear and easily understood problem with a "root cause". Do not approve any proposals that lack a satisfying explanation to the first two prompts. It is CRITICALLY important that we understand the root cause at a minimum even if the solution doesn't directly address it. When we avoid this step, we can end up solving the wrong problems entirely or just writing hacks and workarounds.

Instructions for how to review a proposal:

1. Address each contributor proposal one at a time and address each part of the question one at a time e.g. if a solution looks acceptable, but the stated problem is not clear, then you should provide feedback and make suggestions to improve each prompt before moving on to the next. Avoid responding to all sections of a proposal at once. Move from one question to the next each time asking the contributor to "Please update your original proposal and tag me again when it's ready for review".

2. Limit excessive conversation and moderate issues to keep them on track. If someone is doing any of the following things, please kindly and humbly course-correct them:

- Posting PRs.
- Posting large multi-line diffs (this is basically a PR).
- Skipping any of the required questions.
- Not using the proposal template at all.
- Suggesting that an existing issue is related to the current issue before a problem or root cause has been established.
- Excessively wordy explanations.

3. Choose the first proposal that has a reasonable answer to all the required questions.
-->
