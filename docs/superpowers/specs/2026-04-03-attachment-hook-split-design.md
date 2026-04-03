# Attachment Hook Split

## Problem

`useAttachmentUploadValidation` sits in ComposerProvider with ~10 Onyx subscriptions, mixing file validation (lightweight) with receipt creation (heavy). Its outputs (`validateAttachments`, `onReceiptDropped`) flow through SendState context, causing instability — the compiler tracks them as dependencies, and any Onyx change rebuilds the functions, cascading re-renders to all SendState consumers.

## Design

### New hooks

**`useAttachmentPicker(reportID)`** — lightweight, no Onyx subscriptions
- Calls `useFilesValidation` with callback that opens attachment modal
- Returns: `pickAttachments({dragEvent?, files?})`, `PDFValidationComponent`, `ErrorModal`
- Consumers: ComposerActionMenu (file pick), ComposerInputWrapper (paste)

**`useReceiptDrop(reportID)`** — heavy, owns all receipt Onyx subscriptions
- Calls `useFilesValidation` with callback that handles receipt creation/replacement
- Returns: `onReceiptDropped(event)`, `PDFValidationComponent`, `ErrorModal`
- Consumer: ComposerDropZone only

Each consumer renders its own `PDFValidationComponent`/`ErrorModal` — they render null when inactive, zero cost.

### Coordination: `addAttachment` replacement

Current `addAttachment` writes to `attachmentFileRef` and clears composer via `composerRefShared`. Replace with:

- Add `clearComposer` to `ComposerActionsContext` (stable — wraps `scheduleOnUI(composerRefShared.get().clearWorklet)`)
- Each consumer inlines: `attachmentFileRef.current = file; clearComposer();`
- `attachmentFileRef` in MetaContext, `clearComposer` in Actions — both frozen

`isAttachmentPreviewActive` becomes local state in each consumer.

`onAttachmentPreviewClose` inlined at call sites (3 lines: reset suggestions, clear preview state, restore focus).

### Provider changes

Remove:
- `useAttachmentUploadValidation` call
- `addAttachment` / `onAttachmentPreviewClose` inline functions
- `isAttachmentPreviewActive` state
- `useShouldAddOrReplaceReceipt` call (moves to DropZone — already called there)
- `PDFValidationComponent` / `ErrorModal` from render tree

Add:
- `clearComposer` to ActionsContext

### Context type changes

| Context | Removed | Added |
|---|---|---|
| ComposerSendStateContext | `validateAttachments`, `onReceiptDropped` | — |
| ComposerActionsContext | `addAttachment`, `onAttachmentPreviewClose`, `setIsAttachmentPreviewActive` | `clearComposer` |

### File changes

| File | Action |
|---|---|
| `useAttachmentUploadValidation.ts` | Delete |
| New: `useAttachmentPicker.ts` | ~50 lines |
| New: `useReceiptDrop.ts` | ~80 lines |
| `ComposerContext.ts` | Update SendState and Actions types |
| `ComposerProvider.tsx` | Remove hook/state/functions, add `clearComposer` |
| `ComposerActionMenu.tsx` | Call `useAttachmentPicker`, render validation UI |
| `ComposerInputWrapper.tsx` | Call `useAttachmentPicker` for paste, render validation UI |
| `ComposerDropZone.tsx` | Call `useReceiptDrop`, render validation UI |

### Expected impact

- Provider Onyx subscriptions: ~8 fewer (all receipt-related subs move to DropZone)
- `composerSendState` no longer depends on `validateAttachments`/`onReceiptDropped` — removes the unstable function references the compiler was tracking
- `composerActions` no longer depends on `addAttachment` — removes `composerRefShared` from the dependency chain
