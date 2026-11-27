---
ruleId: PRIVACY-1
title: Mask sensitive data in FullStory
---

## [PRIVACY-1] Mask sensitive data in FullStory

### Reasoning

FullStory records sessions, and everything not masked is readable in the replay. Bank, card, identity, personal and 2FA data must be masked, both where it's typed and where it's shown back. Masking is opt-in: every layer of the App defaults to `fs-unmask`, and FullStory lets a child's `fs-unmask` override a parent's `fs-mask`. A new input inside a plain `<View fsClass={MASK}>` is still recorded, because text inputs set their own class. Several fields lost their mask in refactors that moved them to a component that didn't pass the class on. See [FULLSTORY.md](../../../../contributingGuides/FULLSTORY.md).

### Incorrect

```tsx
// The input sets its own fs-unmask, which overrides the parent's mask
<View fsClass={CONST.FULLSTORY.CLASS.MASK}>
    <InputWrapper
        InputComponent={TextInput}
        inputID={INPUT_IDS.TAX_ID}
        label={translate('businessInfoStep.taxIDNumber')}
    />
</View>

// The routing number is shown back unmasked
<MenuItemField
    name={translate('bankAccount.routingNumber')}
    value={routingNumber}
/>
```

### Correct

```tsx
<FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>
    <InputWrapper
        InputComponent={TextInput}
        inputID={INPUT_IDS.TAX_ID}
        label={translate('businessInfoStep.taxIDNumber')}
    />
</FSClassView>

<MenuItemField
    name={translate('bankAccount.routingNumber')}
    value={routingNumber}
    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
/>
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds or moves an input, or a display of a value, holding one of: a bank account or routing number, a card number, CVV, expiry, PIN or cardholder name, a tax ID, registration number, SSN or ID document, a legal name, date of birth, phone number or home address, a 2FA, magic or validate code, a recovery code, or a password, API key or other credential
- Neither the element nor a container that applies to it masks it. These mask it:
    - `forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}` (or `fsClass` on a `View`, `Text` or `Pressable`) on the element itself
    - an enclosing `FSClassView`, or a `FormProvider`, `ScreenWrapper`, `Modal` or `PopoverWithoutOverlay` with `forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}`. A `ScreenWrapper`, `Modal` or `PopoverWithoutOverlay` in between starts over unmasked, so a masked container above it doesn't count. A closer `UNMASK`, on the element or a nearer container, also overrides the mask
    - for text inputs only, `secureTextEntry`, or an `autoComplete` or `textContentType` value listed in `src/libs/Fullstory/isSensitiveInput.ts`
    - a masked-by-default sub-step (`FullNameStep`, `DateOfBirthStep`, `AddressStep`, `ConfirmationStep`) that the code doesn't override with `UNMASK`, or `RegistrationNumberStep`, which always masks. `ConfirmationStep` only masks its rows, so its `pageSubtitle`, group names and `children` need their own mask when they show sensitive data
    - for anything that isn't a text input, a masked ancestor `View`. A plain `<View fsClass={CONST.FULLSTORY.CLASS.MASK}>` doesn't count for text inputs, because they set their own class

**DO NOT flag if:**

- The value only shows the last 4 digits of a card or account
- The value is a label, a field name, a help or error message, or a placeholder, not the data itself
- The data belongs to a workspace, a report or an expense (workspace name, address or settings, merchant, amount), which are unmasked by design. This doesn't cover bank, card or business identity data, which the first condition covers
- The value is a login, email or display name, even when it's a phone number
- The element is inside a chat that `getChatFSClass` already masks
- The code is a test or story

**Search Patterns** (hints for reviewers):
- `InputComponent={TextInput}` with `inputID` naming an account, routing, card, tax, SSN, DOB, phone, address, legal name or code field
- `MenuItemField`, `MenuItemWithTopDescription` or `Text` whose value comes from `bankAccount`, `card`, `privatePersonalDetails`, `dob`, `ssn`, `taxID` or `addresses`
- `<View fsClass={CONST.FULLSTORY.CLASS.MASK}>` wrapping an input
- a component that renders sensitive data but doesn't take `ForwardedFSClassProps`
