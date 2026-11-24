# FullStory masking

FullStory records sessions on web and native. Everything it records is readable in the replay unless it is masked, so any screen that shows or collects sensitive data has to mask it in code. This guide covers what has to be masked, how masking is wired in the App, and how to check it.

## What is masked

Masked:

- Self DMs
- DMs, groups and rooms that Concierge isn't a member of, including their composer and their message previews in the LHN (the chat name and avatar stay visible). Workspace chats, #admins, #announce, invoice rooms, threads of expenses, reports and invoices, and the user's DM with a custom agent stay unmasked. See `getChatFSClass` below.
- Bank account, wallet and payment card flows: the fields with sensitive or personal data, both the inputs and the screens that show the values back
- Personal details: legal name, date of birth, phone number and address
- Business and identity data: tax IDs, registration numbers, beneficial owners and signers, ID documents
- 2FA, magic and validate codes, and card PINs
- Passwords, API keys and other credentials, such as the accounting integration secrets

Unmasked: everything else, including expenses, reports, Search (apart from the chat items of masked chats) and workspace settings. Displays that only show the last 4 digits of a card or account stay unmasked.

When a new screen shows or collects data from the masked list, mask it in the same PR.

## Classes

`CONST.FULLSTORY.CLASS` has three values:

| Class | Effect |
| --- | --- |
| `MASK` (`fs-mask`) | Text and input values are replaced in the recording, the layout stays visible |
| `UNMASK` (`fs-unmask`) | Recorded as is |
| `EXCLUDE` (`fs-exclude`) | Not recorded at all. Use it for third-party content such as ID verification SDKs and QR codes |

**The closest element with a class decides.** A child with `fs-unmask` is recorded even when a parent has `fs-mask`. Only `fs-exclude` is absolute: its children can't be unmasked. So a `<View fsClass={MASK}>` around content doesn't protect a descendant that sets `UNMASK` on itself, and text inputs do that by default (see below).

## Defaults

Every layer defaults to `UNMASK`, and chats follow their own rules:

| Layer | Where |
| --- | --- |
| Web root | `web/index.html` (`<div id="root" class="fs-unmask">`) |
| App root | `src/App.tsx` |
| Screens | `ScreenWrapperContainer` (`forwardedFSClass`, default `UNMASK`) |
| Modals | `Modal` / `BaseModal` (`forwardedFSClass`, default `UNMASK`) |
| Popovers | `PopoverWithoutOverlay` (`forwardedFSClass`, default `UNMASK`) |
| Chats | `getChatFSClass(report)` in `src/libs/Fullstory/common.ts`, used by the report actions list, the composer, the LHN previews and the Search chat items |

These are readable by design, even inside a masked container: input labels (`TextInputLabel`), `MenuItemField` names, top descriptions of `MenuItem`, help messages (`FormHelpMessage`), error messages (`DotIndicatorMessage`) and tooltips. They describe a field, they don't hold its value.

## How to mask

### Wrap sensitive content in `FSClassView`

```tsx
import FSClassView from '@components/FSClassView';

<FSClassView forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}>
    <Text>{accountNumber}</Text>
    <InputWrapper
        InputComponent={TextInput}
        inputID={INPUT_IDS.ROUTING_NUMBER}
    />
</FSClassView>;
```

`FSClassView` is a `View` that sets the class and hands it to the text inputs inside through `FSClassContext`, so they follow it instead of unmasking themselves by default. Use it instead of `<View fsClass>` around anything that contains an input. `FormProvider`, `ScreenWrapper`, `Modal` and `PopoverWithoutOverlay` provide the same context when you pass them `forwardedFSClass`, so masking a whole form is one prop:

```tsx
<FormProvider
    formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
    // ...
>
```

Limits:

- An input that is passed its own `forwardedFSClass` keeps it, whatever the container says.
- A `ScreenWrapper`, `Modal` or `PopoverWithoutOverlay` inside a masked container starts a new context that defaults to `UNMASK`, so a picker modal opened from a masked form isn't masked unless it's given the class too.

### How a text input picks its class

`useInputFSClass` decides, in this order:

1. The `forwardedFSClass` passed to the input
2. `MASK` when the input is declared with `secureTextEntry` (passwords, API keys), even after the eye toggle shows the value. `BaseTextInput` sets this from the declared prop (`getSecretInputFSClass`)
3. `MASK` when its autofill hints mark it as sensitive (`isSensitiveInput`: card, birthdate, address, postal code, phone and one-time-code values of `autoComplete` or `textContentType`)
4. The class of the closest `FSClassView` (or `FormProvider`, `ScreenWrapper`, `Modal`, `PopoverWithoutOverlay`)
5. `UNMASK`

So give inputs the right `autoComplete` value. It helps autofill and masks the input at the same time. Don't rely on the hints alone for a field they don't cover, such as a legal name or a tax ID.

### Pass the class through custom components

Lint only allows the `fsClass` prop on React Native's `View`, `Animated.View`, `Text`, `Animated.Text` and `Pressable`. A custom component that shows sensitive data takes `ForwardedFSClassProps` and passes `forwardedFSClass` down to one of those:

```tsx
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

type CardHolderProps = ForwardedFSClassProps & {
    name: string;
};

function CardHolder({name, forwardedFSClass}: CardHolderProps) {
    return <Text fsClass={forwardedFSClass}>{name}</Text>;
}
```

Most shared components already do: `TextInput`, `InputWrapper`, `MenuItem` (the whole row, apart from a top description), `MenuItemField`, `AddressForm`, `AddressSearch`, `StatePicker`, `StateSelector`, `DatePicker`, `ValuePicker`, `RadioButtons` and the sub-step forms listed below.

### Sub-step forms

`FullNameStep`, `DateOfBirthStep`, `AddressStep` and `ConfirmationStep` in `src/components/SubStepForms` mask by default, because they are used for KYC and bank flows, and `RegistrationNumberStep` always masks. `SingleFieldStep` doesn't, so pass `forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}` when its field is sensitive. Pass `UNMASK` to a masked-by-default step only when nothing it shows is sensitive. `ConfirmationStep` only masks its rows: its `pageSubtitle`, group names and `children` aren't masked, so mask them yourself if they show sensitive data.

### Content rendered outside its screen

Portals and modals render outside the views of the screen that opened them, so they don't inherit its class. Pass the class to the portal content yourself, for example from `FSClassContext` or `getChatFSClass(report)`.

### Native

On native, React Native flattens a `View` that only lays out its children, and the class goes with it. `FSClassView` marks its view as not collapsible to prevent that. A plain `<View fsClass>` relies on the `nativeID` that `@fullstory/babel-plugin-react-native` adds, which the Re.Pack app pipeline runs through `config/rsbuild/loaders/fullstory-annotation-loader.mjs` (`native: true`). Prefer `FSClassView`.

## How to check

### Web: the DOM

1. Run `npm run web` and open the screen.
2. In DevTools, select the element that holds the value: the `<input>` itself, or the element rendering the text.
3. It must have `fs-mask`, or have no class of its own under an ancestor with `fs-mask`. If the element itself has `fs-unmask`, it gets recorded.

The classes render even when FullStory isn't running.

### Native: the component tree

1. Open React Native DevTools: press `j` in the bundler terminal, or use the dev menu › Open DevTools.
2. In the Components tab, select the `View`, `Text` or `TextInput` that holds the value.
3. Its `fsClass` must be `fs-mask`, or it must have none under an ancestor with `fs-mask`.

### A real recording

`shouldInitializeFullstory` (`src/libs/Fullstory/common.ts`) starts FullStory in production for everyone, and in any environment for test accounts whose email starts with `fullstory` on the QA domain. It never starts for `@expensify.com` accounts, and on web it shuts down for support logins (`src/libs/Fullstory/index.ts`). FullStory's "Capture data by domain" setting then decides which hosts are recorded: local web (`dev.new.expensify.com`) and staging aren't. So to record a change before it ships, sign in with a `fullstory*` QA-domain account on a host FullStory captures:

- **AdHoc build:** open a draft PR and ask for an AdHoc build. Test on `https://<PR number>.adhoc.expensify.com` and on the AdHoc native apps.
- **Local web**, with a hostname the capture settings allow:
    1. Add `127.0.0.1 local.adhoc.expensify.com` to `/etc/hosts`, so the `*.adhoc.expensify.com` rule in "Capture data by domain" matches it.
    2. Regenerate the dev certificate with that name: `mkcert -cert-file config/rsbuild/certificate.pem -key-file config/rsbuild/key.pem dev.new.expensify.com local.adhoc.expensify.com localhost 127.0.0.1`. Run `mkcert -install` first if you never set up HTTPS for the App.
    3. Restart `npm run web` and open the URL it prints, with `dev.new.expensify.com` swapped for `local.adhoc.expensify.com` (the port is 8082 unless another session took it).

To record with any other account, make `shouldInitializeFullstory` return `true` temporarily. Never merge that change.

Then find the session in FullStory (search by your email) and check that the values aren't readable in the replay.

While Form Privacy is on in the FullStory settings, FullStory masks every input on web whatever class the code sets. On web, judge text that displays a value; judge inputs on native or in the DOM.
