# Composer Context Restructure

## Problem

The ReportActionCompose compound component decomposition (branch `decompose/report-action-composer-v2`) introduces a +25% render duration regression and +59% more render commits vs main. Root causes:

1. **Context value instability** — `ComposerActionsContext` contains `handleSendMessage` which closes over `isSendDisabled` (changes on empty/non-empty flip), causing all action consumers to re-render. `ComposerMetaContext` contains JSX nodes (`PDFValidationComponent`, `ErrorModal`) that are recreated each render.
2. **Provider as data intermediary** — ComposerProvider fetches ~8 Onyx keys and distributes them through context. Per CLEAN-REACT-PATTERNS-2, components should self-subscribe.
3. **Contexts split by semantic type, not change frequency** — Stable refs and unstable JSX nodes share `ComposerMetaContext`. Stable setters and unstable handlers share `ComposerActionsContext`.

Profiling shows +110 Hoverable renders and +110 GenericTooltip renders from ActionMenu and InputWrapper re-rendering on context instability, cascading into their internal component trees.

## Design

### Principle

- Each component self-subscribes to Onyx data (PATTERNS-2)
- Only ephemeral coordination state goes through context (PATTERNS-5)
- Provider + compound component pattern maintained (PATTERNS-1)
- Contexts organized by change frequency: frozen, warm, hot
- State/actions split enforced per codebase convention

### Contexts (6)

| Context | Contents | Frequency |
|---|---|---|
| `ComposerTextContext` | `value` | Every keystroke |
| `ComposerStateContext` | `isFocused`, `isMenuVisible`, `isFullComposerAvailable` | User interactions |
| `ComposerSendStateContext` | `isEmpty`, `isSendDisabled`, `exceededMaxLength`, `hasExceededMaxTaskTitleLength`, `isBlockedFromConcierge`, `validateAttachments`, `onReceiptDropped` | Debounced / infrequent |
| `ComposerActionsContext` | `setValue`, `setIsFocused`, `setMenuVisibility`, `setIsFullComposerAvailable`, `setComposerRef`, `setIsAttachmentPreviewActive`, `focus`, `onBlur`, `onFocus`, `onAddActionPressed`, `onItemSelected`, `onTriggerAttachmentPicker`, `addAttachment`, `onAttachmentPreviewClose` | Frozen |
| `ComposerSendActionsContext` | `handleSendMessage`, `onValueChange`, `validateMaxLength`, `debouncedValidate` | Infrequent |
| `ComposerMetaContext` | `containerRef`, `composerRef`, `suggestionsRef`, `actionButtonRef`, `isNextModalWillOpenRef` | Frozen |

### Per-component subscriptions

| Component | Contexts | Self-subscribes (Onyx) |
|---|---|---|
| ComposerBox | State, SendState | `isComposerFullSize`, `report` |
| ComposerDropZone | SendState | *(existing Onyx subs)* |
| ComposerActionMenu | State, SendState, Actions, Meta | `isComposerFullSize`, `report`, `shouldFocusComposerOnScreenFocus` |
| ComposerInputWrapper | State, SendState, SendActions, Actions, Meta | `isComposerFullSize`, `shouldShowComposeInput`, `userBlockedFromConcierge`, `report` |
| ComposerEmojiPicker | Actions, Meta | `isBlockedFromConcierge` |
| ComposerSendButton | SendState, SendActions | — |
| ComposerFooter | SendState | — |
| ComposerLocalTime | — | `isComposerFullSize` |
| ComposerWithSuggestions | Text, Actions | — |

### Values removed from context

| Value | Reason | New home |
|---|---|---|
| `isComposerFullSize` | Onyx key, each component reads directly | `useOnyx(REPORT_IS_COMPOSER_FULL_SIZE + reportID)` in Box, ActionMenu, InputWrapper, LocalTime, ReportActionCompose |
| `shouldShowComposeInput` | Onyx key, one consumer | `useOnyx(SHOULD_SHOW_COMPOSE_INPUT)` in InputWrapper |
| `shouldFocusComposerOnScreenFocus` | Derived from Onyx + platform check, one consumer | Compute locally in ActionMenu |
| `userBlockedFromConcierge` | Derived from Onyx, one consumer | Compute in InputWrapper |
| `isAttachmentPreviewActive` | Only used by provider internally | Provider-internal state |
| `PDFValidationComponent` | JSX node, was causing context instability | Rendered directly by Provider as sibling |
| `ErrorModal` | JSX node, was causing context instability | Rendered directly by Provider as sibling |

### Hook relocation

| Hook | From | To | Reason |
|---|---|---|---|
| `useComposerSubmit` | ComposerProvider | ComposerInputWrapper | `submitForm` has one consumer; removes ~12 Onyx subscriptions from provider |
| `useComposerFocus` | ComposerProvider | ComposerProvider (stays) | All outputs are stable (close over refs + useState setters); shared by multiple consumers |
| `useAttachmentUploadValidation` | ComposerProvider | ComposerProvider (stays) | `validateAttachments` shared by 3 consumers; JSX rendering moves out of context |

`useComposerSubmit` will be split: `addAttachment` and `onAttachmentPreviewClose` (stable, used by validation hook) stay in provider. `submitForm` (unstable, one consumer) moves to InputWrapper.

### Provider rendering

```tsx
return (
    <ComposerTextContext.Provider value={text}>
        <ComposerStateContext.Provider value={state}>
            <ComposerSendStateContext.Provider value={sendState}>
                <ComposerActionsContext.Provider value={actions}>
                    <ComposerSendActionsContext.Provider value={sendActions}>
                        <ComposerMetaContext.Provider value={meta}>
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

## File changes

| File | Action |
|---|---|
| `ComposerContext.ts` | Rewrite — 6 contexts + 6 hooks replacing current 6 + 6 |
| `ComposerProvider.tsx` | Major rewrite — remove `useComposerSubmit`, restructure context values, render JSX directly |
| `ComposerBox.tsx` | Update imports (3 to 2 contexts), add `useOnyx` for `isComposerFullSize` |
| `ComposerDropZone.tsx` | Update import (`MetaActions` to `SendState`) |
| `ComposerActionMenu.tsx` | Update imports (5 to 4 contexts), add self-subscriptions |
| `ComposerInputWrapper.tsx` | Update imports (5 to 5 contexts, different set), add `useComposerSubmit`, add self-subscriptions |
| `ComposerEmojiPicker.tsx` | Update imports (3 to 2 contexts), add self-subscription for `isBlockedFromConcierge` |
| `ComposerSendButton.tsx` | Update imports (2 to 2 contexts, different ones) |
| `ComposerFooter.tsx` | No change |
| `ComposerLocalTime.tsx` | Remove context, add `useOnyx` for `isComposerFullSize` |
| `ComposerWithSuggestions.tsx` | Update imports (Value+Actions to Text+Actions) |
| `ReportActionCompose.tsx` | Remove `useOnyx` for `isComposerFullSize` |
| `useComposerSubmit.ts` | Split — extract `addAttachment` + `onAttachmentPreviewClose` to stay in provider |
| `useComposerFocus.ts` | No change |
| `useAttachmentUploadValidation.ts` | No change |

## Expected impact

- **Keystroke path**: Only `ComposerTextContext` fires. Only `ComposerWithSuggestions` re-renders. ActionMenu, Box, SendButton, Footer untouched.
- **Menu toggle**: Only `ComposerStateContext` fires. Only Box, ActionMenu, InputWrapper re-render.
- **Provider Onyx subscriptions**: ~20 total down to ~8 after moving `useComposerSubmit` out.
- **Frozen contexts**: `ComposerActionsContext` and `ComposerMetaContext` never fire — holds the bulk of the shared API.
- **Hoverable/GenericTooltip renders**: Should drop from ~182/110 back to ~72 range (matching main) since ActionMenu no longer re-renders on keystroke.
