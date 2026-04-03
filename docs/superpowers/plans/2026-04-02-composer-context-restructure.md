# Composer Context Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure 6 composer contexts from semantic grouping (state/actions/meta) to change-frequency grouping (frozen/warm/hot), move Onyx subscriptions to self-subscribing consumers, and relocate `useComposerSubmit` to its sole consumer.

**Architecture:** 6 contexts organized by stability — 2 frozen (Actions, Meta), 3 warm (State, SendState, SendActions), 1 hot (Text). Provider sheds ~12 Onyx subscriptions by relocating `useComposerSubmit` to InputWrapper. Each compound child self-subscribes to Onyx data it previously received through context.

**Tech Stack:** React Context, React Native Onyx (`useOnyx`), TypeScript

**Spec:** `docs/superpowers/specs/2026-04-02-composer-context-restructure-design.md`

---

All files live under `src/pages/inbox/report/ReportActionCompose/` unless otherwise noted.

### Task 1: Rewrite ComposerContext.ts — new types and contexts

**Files:**
- Modify: `ComposerContext.ts`

- [ ] **Step 1: Replace all types and context definitions**

Replace the entire file with the new 6-context structure. The old types (`ComposerState`, `ComposerSendState`, `ComposerActions`, `ComposerMeta`, `ComposerMetaActions`) are replaced by new ones aligned to change frequency.

```ts
import type {ReactNode, RefObject} from 'react';
import {createContext, useContext} from 'react';
import type {BlurEvent, View} from 'react-native';
import type {FileObject} from '@src/types/utils/Attachment';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';

type SuggestionsRef = {
    resetSuggestions: () => void;
    onSelectionChange?: (event: import('react-native').TextInputSelectionChangeEvent) => void;
    triggerHotkeyActions: (event: KeyboardEvent) => boolean | undefined;
    updateShouldShowSuggestionMenuToFalse: (shouldShowSuggestionMenu?: boolean) => void;
    setShouldBlockSuggestionCalc: (shouldBlock: boolean) => void;
    getSuggestions: () => import('@components/MentionSuggestions').Mention[] | import('@assets/emojis/types').Emoji[];
    getIsSuggestionsMenuVisible: () => boolean;
};

// ── Hot: changes every keystroke ──────────────────────────
type ComposerText = string;

// ── Warm: changes on user interactions ────────────────────
type ComposerState = {
    isFocused: boolean;
    isMenuVisible: boolean;
    isFullComposerAvailable: boolean;
};

// ── Warm: changes on debounced validation / infrequent ────
type ComposerSendState = {
    isEmpty: boolean;
    isSendDisabled: boolean;
    exceededMaxLength: number | null;
    hasExceededMaxTaskTitleLength: boolean;
    isBlockedFromConcierge: boolean;
    validateAttachments: (args: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => void;
    onReceiptDropped: (event: DragEvent) => void;
};

// ── Frozen: stable setters + ref-closing callbacks ────────
type ComposerActions = {
    setValue: (v: string) => void;
    setIsFocused: (v: boolean) => void;
    setMenuVisibility: (v: boolean) => void;
    setIsFullComposerAvailable: (v: boolean) => void;
    setComposerRef: (ref: ComposerRef | null) => void;
    setIsAttachmentPreviewActive: (isActive: boolean) => void;
    focus: () => void;
    onBlur: (event: BlurEvent) => void;
    onFocus: () => void;
    onAddActionPressed: () => void;
    onItemSelected: () => void;
    onTriggerAttachmentPicker: () => void;
    addAttachment: (file: FileObject | FileObject[]) => void;
    onAttachmentPreviewClose: () => void;
};

// ── Infrequent: reactive handlers that close over state ───
type ComposerSendActions = {
    handleSendMessage: () => void;
    onValueChange: (value: string) => void;
    validateMaxLength: (value: string) => boolean;
    debouncedValidate: {
        (value: string): boolean | undefined;
        cancel: () => void;
        flush: () => boolean | undefined;
    };
};

// ── Frozen: refs only ─────────────────────────────────────
type ComposerMeta = {
    containerRef: RefObject<View | null>;
    composerRef: RefObject<ComposerRef | null>;
    suggestionsRef: RefObject<SuggestionsRef | null>;
    actionButtonRef: RefObject<View | HTMLDivElement | null>;
    isNextModalWillOpenRef: RefObject<boolean>;
    attachmentFileRef: RefObject<FileObject | FileObject[] | null>;
};

// ── Defaults ──────────────────────────────────────────────

const noop = () => {};

const defaultState: ComposerState = {
    isFocused: false,
    isMenuVisible: false,
    isFullComposerAvailable: false,
};

const defaultSendState: ComposerSendState = {
    isEmpty: true,
    isSendDisabled: true,
    exceededMaxLength: null,
    hasExceededMaxTaskTitleLength: false,
    isBlockedFromConcierge: false,
    validateAttachments: noop,
    onReceiptDropped: noop,
};

const defaultActions: ComposerActions = {
    setValue: noop,
    setIsFocused: noop,
    setMenuVisibility: noop,
    setIsFullComposerAvailable: noop,
    setComposerRef: noop,
    setIsAttachmentPreviewActive: noop,
    focus: noop,
    onBlur: noop,
    onFocus: noop,
    onAddActionPressed: noop,
    onItemSelected: noop,
    onTriggerAttachmentPicker: noop,
    addAttachment: noop,
    onAttachmentPreviewClose: noop,
};

const defaultSendActions: ComposerSendActions = {
    handleSendMessage: noop,
    onValueChange: noop,
    validateMaxLength: () => true,
    debouncedValidate: Object.assign(() => true as boolean | undefined, {cancel: noop, flush: () => true as boolean | undefined}),
};

// ── Contexts ──────────────────────────────────────────────

const ComposerTextContext = createContext<ComposerText>('');
const ComposerStateContext = createContext<ComposerState>(defaultState);
const ComposerSendStateContext = createContext<ComposerSendState>(defaultSendState);
const ComposerActionsContext = createContext<ComposerActions>(defaultActions);
const ComposerSendActionsContext = createContext<ComposerSendActions>(defaultSendActions);
const ComposerMetaContext = createContext<ComposerMeta | null>(null);

// ── Hooks ─────────────────────────────────────────────────

function useComposerText() {
    return useContext(ComposerTextContext);
}

function useComposerState() {
    return useContext(ComposerStateContext);
}

function useComposerSendState() {
    return useContext(ComposerSendStateContext);
}

function useComposerActions() {
    return useContext(ComposerActionsContext);
}

function useComposerSendActions() {
    return useContext(ComposerSendActionsContext);
}

function useComposerMeta() {
    const ctx = useContext(ComposerMetaContext);
    if (!ctx) {
        throw new Error('useComposerMeta must be used inside ComposerProvider');
    }
    return ctx;
}

export {
    ComposerTextContext,
    ComposerStateContext,
    ComposerSendStateContext,
    ComposerActionsContext,
    ComposerSendActionsContext,
    ComposerMetaContext,
    useComposerText,
    useComposerState,
    useComposerSendState,
    useComposerActions,
    useComposerSendActions,
    useComposerMeta,
};
export type {SuggestionsRef, ComposerText, ComposerState, ComposerSendState, ComposerActions, ComposerSendActions, ComposerMeta};
```

- [ ] **Step 2: Commit**

```bash
git add ComposerContext.ts
git commit -m "Rewrite ComposerContext — 6 contexts by change frequency"
```

---

### Task 2: Split useComposerSubmit

The hook currently returns `{submitForm, addAttachment, onAttachmentPreviewClose}`. `submitForm` is the only export that has many Onyx subscriptions (~12). `addAttachment` and `onAttachmentPreviewClose` are stable (close over refs/setters only).

Split: extract `addAttachment` and `onAttachmentPreviewClose` out of the hook so they can be defined inline in the provider. The hook keeps `submitForm` only and will be called from InputWrapper.

**Files:**
- Modify: `useComposerSubmit.ts`

- [ ] **Step 1: Remove addAttachment and onAttachmentPreviewClose from the hook**

Remove the `composerRefShared`, `updateShouldShowSuggestionMenuToFalse`, and `setIsAttachmentPreviewActive` params. Remove the `addAttachment` and `onAttachmentPreviewClose` functions. Add `attachmentFileRef` as a param (previously internal). The hook now takes:

```ts
type UseComposerSubmitParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    reportID: string;
    attachmentFileRef: RefObject<FileObject | FileObject[] | null>;
};
```

Update the hook signature and return type to only return `{submitForm}`.

Remove these lines from the hook body:
```ts
const addAttachment = (file: FileObject | FileObject[]) => { ... };
const onAttachmentPreviewClose = () => { ... };
```

Update the return:
```ts
return {submitForm};
```

Remove unused imports: `scheduleOnUI`, `ComposerFocusManager` (if only used by removed functions).

- [ ] **Step 2: Commit**

```bash
git add useComposerSubmit.ts
git commit -m "Split useComposerSubmit — keep only submitForm"
```

---

### Task 3: Rewrite ComposerProvider

**Files:**
- Modify: `ComposerProvider.tsx`

- [ ] **Step 1: Update imports**

Replace old context imports with new ones:

```ts
import {
    ComposerActionsContext,
    ComposerMetaContext,
    ComposerSendActionsContext,
    ComposerSendStateContext,
    ComposerStateContext,
    ComposerTextContext,
} from './ComposerContext';
import type {SuggestionsRef} from './ComposerContext';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
```

Remove import for `useComposerSubmit`.

- [ ] **Step 2: Rewrite the provider body**

The provider no longer calls `useComposerSubmit`. Instead it defines `addAttachment` and `onAttachmentPreviewClose` inline. It creates `attachmentFileRef` and includes it in `ComposerMeta`. It structures 6 context value objects.

Key changes from current provider:

1. Add `attachmentFileRef`:
```ts
const attachmentFileRef = useRef<FileObject | FileObject[] | null>(null);
```

2. Replace `useComposerSubmit` call with inline `addAttachment` and `onAttachmentPreviewClose`:
```ts
const addAttachment = (file: FileObject | FileObject[]) => {
    attachmentFileRef.current = file;
    const clearWorklet = composerRefShared.get().clearWorklet;
    if (!clearWorklet) {
        throw new Error('The composerRef.clearWorklet function is not set yet.');
    }
    scheduleOnUI(clearWorklet);
};

const updateShouldShowSuggestionMenuToFalse = () => {
    if (!suggestionsRef.current) {
        return;
    }
    suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
};

const onAttachmentPreviewClose = () => {
    updateShouldShowSuggestionMenuToFalse();
    setIsAttachmentPreviewActive(false);
    ComposerFocusManager.setReadyToFocus();
};
```

3. Add `ComposerFocusManager` import:
```ts
import ComposerFocusManager from '@libs/ComposerFocusManager';
```

4. Build 6 context value objects:

```ts
const text = value;

const composerState = {
    isFocused,
    isMenuVisible,
    isFullComposerAvailable,
};

const composerSendState = {
    isEmpty,
    isSendDisabled,
    exceededMaxLength,
    hasExceededMaxTaskTitleLength,
    isBlockedFromConcierge,
    validateAttachments,
    onReceiptDropped,
};

const composerActions = {
    setValue,
    setIsFocused,
    setMenuVisibility,
    setIsFullComposerAvailable,
    setComposerRef,
    setIsAttachmentPreviewActive,
    focus,
    onBlur,
    onFocus,
    onAddActionPressed,
    onItemSelected,
    onTriggerAttachmentPicker,
    addAttachment,
    onAttachmentPreviewClose,
};

const composerSendActions = {
    handleSendMessage,
    onValueChange,
    validateMaxLength,
    debouncedValidate,
};

const composerMeta = {
    containerRef,
    composerRef,
    suggestionsRef,
    actionButtonRef,
    isNextModalWillOpenRef,
    attachmentFileRef,
};
```

5. Render 6 providers + JSX directly:

```tsx
return (
    <ComposerTextContext.Provider value={text}>
        <ComposerStateContext.Provider value={composerState}>
            <ComposerSendStateContext.Provider value={composerSendState}>
                <ComposerActionsContext.Provider value={composerActions}>
                    <ComposerSendActionsContext.Provider value={composerSendActions}>
                        <ComposerMetaContext.Provider value={composerMeta}>
                            {children}
                        </ComposerMetaContext.Provider>
                    </ComposerSendActionsContext.Provider>
                </ComposerActionsContext.Provider>
            </ComposerSendStateContext.Provider>
        </ComposerStateContext.Provider>
        {PDFValidationComponent}
        {ErrorModal}
    </ComposerTextContext.Provider>
);
```

Remove: all old context value object construction (`composerMetaState`, `composerMetaActions`, etc.).
Remove: the `useComposerSubmit` call and its destructuring.
Remove: old `submitForm` usage in `useAttachmentUploadValidation` params — wait, `useAttachmentUploadValidation` takes `addAttachment` and `onAttachmentPreviewClose`, which are now inline. They're already available in scope. No change needed for the validation hook call.

- [ ] **Step 3: Commit**

```bash
git add ComposerProvider.tsx
git commit -m "Rewrite ComposerProvider — 6 frequency-based contexts, inline addAttachment"
```

---

### Task 4: Update ComposerLocalTime — remove context, self-subscribe

**Files:**
- Modify: `ComposerLocalTime.tsx`

- [ ] **Step 1: Replace context with self-subscription**

Remove:
```ts
import {useComposerState} from './ComposerContext';
```
and the destructure:
```ts
const {isComposerFullSize} = useComposerState();
```

Add:
```ts
import ONYXKEYS from '@src/ONYXKEYS';
```
(if not already imported) and:
```ts
const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
```

`useOnyx` is already imported in this file. `ONYXKEYS` is already imported.

- [ ] **Step 2: Commit**

```bash
git add ComposerLocalTime.tsx
git commit -m "ComposerLocalTime self-subscribes to isComposerFullSize"
```

---

### Task 5: Update ComposerSendButton — switch to SendState + SendActions

**Files:**
- Modify: `ComposerSendButton.tsx`

- [ ] **Step 1: Update context imports**

Replace:
```ts
import {useComposerActions, useComposerSendState} from './ComposerContext';
```
with:
```ts
import {useComposerSendActions, useComposerSendState} from './ComposerContext';
```

Replace:
```ts
const {handleSendMessage} = useComposerActions();
```
with:
```ts
const {handleSendMessage} = useComposerSendActions();
```

- [ ] **Step 2: Commit**

```bash
git add ComposerSendButton.tsx
git commit -m "ComposerSendButton reads from SendState + SendActions"
```

---

### Task 6: Update ComposerEmojiPicker — switch to Actions + Meta, self-subscribe

**Files:**
- Modify: `ComposerEmojiPicker.tsx`

- [ ] **Step 1: Update context imports and add self-subscription**

Replace:
```ts
import {useComposerActions, useComposerMetaState, useComposerSendState} from './ComposerContext';
```
with:
```ts
import {useComposerActions, useComposerMeta} from './ComposerContext';
```

Add Onyx imports if not present:
```ts
import useOnyx from '@hooks/useOnyx';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
```

Replace:
```ts
const {isBlockedFromConcierge} = useComposerSendState();
const {focus} = useComposerActions();
const {composerRef} = useComposerMetaState();
```
with:
```ts
const {focus} = useComposerActions();
const {composerRef} = useComposerMeta();

const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const isBlockedFromConcierge = chatIncludesConcierge({participants: report?.participants}) && isBlockedFromConciergeUserAction(blockedFromConcierge);
```

- [ ] **Step 2: Commit**

```bash
git add ComposerEmojiPicker.tsx
git commit -m "ComposerEmojiPicker self-subscribes to isBlockedFromConcierge"
```

---

### Task 7: Update ComposerDropZone — switch from MetaActions to SendState

**Files:**
- Modify: `ComposerDropZone.tsx`

- [ ] **Step 1: Update context import**

Replace:
```ts
import {useComposerMetaActions} from './ComposerContext';
```
with:
```ts
import {useComposerSendState} from './ComposerContext';
```

Replace:
```ts
const {validateAttachments, onReceiptDropped} = useComposerMetaActions();
```
with:
```ts
const {validateAttachments, onReceiptDropped} = useComposerSendState();
```

- [ ] **Step 2: Commit**

```bash
git add ComposerDropZone.tsx
git commit -m "ComposerDropZone reads from SendState"
```

---

### Task 8: Update ComposerBox — switch to State + SendState, self-subscribe

**Files:**
- Modify: `ComposerBox.tsx`

- [ ] **Step 1: Update context imports and add self-subscription**

Replace:
```ts
import {useComposerMetaState, useComposerSendState, useComposerState} from './ComposerContext';
```
with:
```ts
import {useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';
```

Replace:
```ts
const {isFocused, isComposerFullSize} = useComposerState();
const {exceededMaxLength, isBlockedFromConcierge} = useComposerSendState();
const {containerRef, PDFValidationComponent, ErrorModal} = useComposerMetaState();
```
with:
```ts
const {isFocused} = useComposerState();
const {exceededMaxLength, isBlockedFromConcierge} = useComposerSendState();
const {containerRef} = useComposerMeta();
const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
```

Ensure `useOnyx` and `ONYXKEYS` are imported (both already are in this file).

Remove `PDFValidationComponent` and `ErrorModal` from the JSX. Replace:
```tsx
<View ref={containerRef} style={[...]}>
    {PDFValidationComponent}
    {children}
</View>
{ErrorModal}
```
with:
```tsx
<View ref={containerRef} style={[...]}>
    {children}
</View>
```

- [ ] **Step 2: Commit**

```bash
git add ComposerBox.tsx
git commit -m "ComposerBox self-subscribes, PDFValidation/ErrorModal rendered by provider"
```

---

### Task 9: Update ComposerActionMenu — switch contexts, self-subscribe

**Files:**
- Modify: `ComposerActionMenu.tsx`

- [ ] **Step 1: Update context imports and add self-subscriptions**

Replace:
```ts
import {useComposerActions, useComposerMetaActions, useComposerMetaState, useComposerSendState, useComposerState} from './ComposerContext';
```
with:
```ts
import {useComposerActions, useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';
```

Replace the context reads:
```ts
const {isComposerFullSize, isFullComposerAvailable, isMenuVisible} = useComposerState();
const {isBlockedFromConcierge, exceededMaxLength} = useComposerSendState();
const {setMenuVisibility, focus} = useComposerActions();
const {actionButtonRef, shouldFocusComposerOnScreenFocus} = useComposerMetaState();
const {onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, validateAttachments} = useComposerMetaActions();
```
with:
```ts
const {isMenuVisible, isFullComposerAvailable} = useComposerState();
const {isBlockedFromConcierge, exceededMaxLength, validateAttachments} = useComposerSendState();
const {setMenuVisibility, focus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker} = useComposerActions();
const {actionButtonRef} = useComposerMeta();

const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
```

Add import for `canFocusInputOnScreenFocus` and compute `shouldFocusComposerOnScreenFocus` locally:
```ts
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
```

Before the return, add:
```ts
const shouldFocusComposerOnScreenFocus = canFocusInputOnScreenFocus() || !!draftComment;
```

Ensure `useOnyx` and `ONYXKEYS` are imported (already present).

- [ ] **Step 2: Commit**

```bash
git add ComposerActionMenu.tsx
git commit -m "ComposerActionMenu self-subscribes, reads 4 contexts"
```

---

### Task 10: Update ComposerInputWrapper — switch contexts, add useComposerSubmit, self-subscribe

This is the largest consumer change. InputWrapper now calls `useComposerSubmit` directly (previously in provider).

**Files:**
- Modify: `ComposerInputWrapper.tsx`

- [ ] **Step 1: Update context imports**

Replace:
```ts
import {useComposerActions, useComposerMetaActions, useComposerMetaState, useComposerSendState, useComposerState} from './ComposerContext';
```
with:
```ts
import {useComposerActions, useComposerMeta, useComposerSendActions, useComposerSendState, useComposerState} from './ComposerContext';
```

- [ ] **Step 2: Add self-subscriptions and useComposerSubmit**

Add imports:
```ts
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import useComposerSubmit from './useComposerSubmit';
```

Replace context reads:
```ts
const {isComposerFullSize, isMenuVisible} = useComposerState();
const {isBlockedFromConcierge} = useComposerSendState();
const {setIsFullComposerAvailable, handleSendMessage, onValueChange} = useComposerActions();
const {containerRef, suggestionsRef, isNextModalWillOpenRef, shouldShowComposeInput, userBlockedFromConcierge} = useComposerMetaState();
const {onBlur, onFocus, submitForm, validateAttachments, setComposerRef} = useComposerMetaActions();
```
with:
```ts
const {isMenuVisible} = useComposerState();
const {isBlockedFromConcierge, validateAttachments} = useComposerSendState();
const {setIsFullComposerAvailable, onBlur, onFocus, setComposerRef} = useComposerActions();
const {handleSendMessage, onValueChange} = useComposerSendActions();
const {containerRef, suggestionsRef, isNextModalWillOpenRef, attachmentFileRef} = useComposerMeta();

const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);

const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);

const {submitForm} = useComposerSubmit({report, reportID, attachmentFileRef});
```

Note: `report` is already fetched via `useOnyx` in the current file — keep the existing subscription and reuse it. Remove the duplicate if there is one.

- [ ] **Step 3: Commit**

```bash
git add ComposerInputWrapper.tsx
git commit -m "ComposerInputWrapper self-subscribes, calls useComposerSubmit directly"
```

---

### Task 11: Update ComposerWithSuggestions — Text + Actions

**Files:**
- Modify: `ComposerWithSuggestions/ComposerWithSuggestions.tsx`

- [ ] **Step 1: Update context imports**

Replace:
```ts
import {useComposerActions, useComposerValue} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
```
with:
```ts
import {useComposerActions, useComposerText} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
```

Replace:
```ts
const value = useComposerValue();
const {setValue} = useComposerActions();
```
with:
```ts
const value = useComposerText();
const {setValue} = useComposerActions();
```

- [ ] **Step 2: Commit**

```bash
git add ComposerWithSuggestions/ComposerWithSuggestions.tsx
git commit -m "ComposerWithSuggestions reads Text + Actions"
```

---

### Task 12: Update ReportActionCompose — remove isComposerFullSize subscription

**Files:**
- Modify: `ReportActionCompose.tsx`

- [ ] **Step 1: Remove Onyx subscription**

The orchestrator currently reads `isComposerFullSize` for layout styling. Each child now self-subscribes, but the orchestrator still needs it for the outer `View` style `isComposerFullSize && styles.chatItemFullComposeRow`.

Keep the `useOnyx` call in the orchestrator — it's used for its own rendering, not passed to children. No change needed here.

Verify no old context hooks are imported. The file should not import anything from `ComposerContext.ts` (it doesn't currently — it only imports the component types).

- [ ] **Step 2: Commit (skip if no changes)**

---

### Task 13: Update ComposerFooter — verify no changes needed

**Files:**
- Verify: `ComposerFooter.tsx`

- [ ] **Step 1: Verify**

ComposerFooter already reads only `useComposerSendState()` for `exceededMaxLength` and `hasExceededMaxTaskTitleLength`. Both fields still exist in the new `ComposerSendStateContext`. No code changes needed.

---

### Task 14: Verification — typecheck, lint, prettier

- [ ] **Step 1: Run TypeScript check**

```bash
cd /Users/adhorodyski/Developer/Expensify-App-w2 && npm run typecheck-tsgo
```

Fix any type errors. Common issues:
- Old hook names (`useComposerValue` → `useComposerText`, `useComposerMetaState` → `useComposerMeta`, `useComposerMetaActions` → removed)
- Missing imports for new hooks
- Type mismatches from restructured context types

- [ ] **Step 2: Run ESLint**

```bash
npx eslint src/pages/inbox/report/ReportActionCompose/ --max-warnings=0
```

- [ ] **Step 3: Run Prettier**

```bash
npx prettier --write src/pages/inbox/report/ReportActionCompose/
```

- [ ] **Step 4: Commit fixes**

```bash
git add -A && git commit -m "Fix typecheck, lint, prettier"
```

---

### Task 15: Run existing perf test

- [ ] **Step 1: Run the ReportActionCompose perf test**

```bash
npx reassure --testPathPattern "ReportActionCompose"
```

Verify render counts haven't increased. The test covers: text input interaction, create button press, send button press.

- [ ] **Step 2: Manual verification**

Re-profile the "click MenuItem + Escape" scenario in React DevTools. Compare against the before/after profiles from the brainstorming session. Expected:
- Render commits: ~21 (matching main), down from ~33
- Hoverable renders: ~72 (matching main), down from ~182
- Total duration: ~215ms (matching main), down from ~270ms
