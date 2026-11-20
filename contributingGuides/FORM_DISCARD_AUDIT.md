# Unsaved form exit audit

Scope: [Show “Discard changes” confirmation whenever leaving a form with unsaved changes](https://github.com/Expensify/App/issues/106066).

## Implemented rollout

- Separate Home address editor, including address search and country/state pickers.
- Private details together with its verification screen, including direct-linked verification.
- Manual personal bank setup through confirmation and security code verification, from Wallet and standalone entry points.
- Existing personal-bank information editing, including skipped initial steps.
- Workspace description.
- Category creation from workspace settings and quick Settings. Other category consumers are not implicitly enabled.

This rollout depends on [flow-root discard protection](https://github.com/Expensify/App/pull/106977). It uses that implementation's unfocused flow owner, replay and suppression infrastructure, not a second navigation interceptor. Settings contains unrelated screens, so an explicit operation boundary overrides the dependency's default same-stack replacement exemption. The earliest actually mounted member owns the guard; a first step is not assumed to exist after direct entry or skipped bank steps.

Private and bank submissions remain protected while pending and after failure. Only successful completion permits intentional exit without confirmation. Ordinary unmount, internal Back and cancelled exits do not perform abandonment cleanup.

Create expense remains owned by [the expense discard issue](https://github.com/Expensify/App/issues/104579); this rollout does not introduce another expense guard.

## Remaining-form audit

These findings come from code inspection of the pre-rollout revision linked below. They are **not additional integrations** in this change. Draft flags, an Onyx key, or a Save button alone do not prove that input survives normal re-entry; initialization and teardown must also be checked. Custom editors must be included alongside direct shared-form consumers.

| Remaining form | Persistence evidence | Disposition |
|---|---|---|
| Profile display name | [Saved defaults, no input drafting](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Profile/DisplayNamePage.tsx#L58-L104) | Local/lossy: add a dirty-exit guard. |
| Custom status | [Draft cleared on unmount](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Profile/CustomStatus/StatusPage.tsx#L89-L126) | Lossy: protect text, emoji and expiry together. |
| Profile AI prompt | [Custom local editor with explicit Save](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Profile/AgentAIPromptSection.tsx#L165-L201) | Local/lossy: protect at its owning screen; shared-form changes alone miss this editor. |
| Agent instructions | [Explicit save and local input](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Agents/Fields/DynamicEditPromptPage.tsx#L102-L160) | Local/lossy: prioritize lengthy instruction edits. |
| Workspace name | [Submit-only update and non-drafted input](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/workspace/WorkspaceNamePage.tsx#L36-L97) | Local/lossy: separate from description. |
| Tag creation | [Create on submit, local name](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/workspace/tags/WorkspaceCreateTagPage.tsx#L88-L146) | Local/lossy: separate from category creation. |
| Distance-rate creation | [Non-drafted inputs](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/workspace/distanceRates/CreateDistanceRatePage.tsx#L126-L160) | Local/lossy: cover workspace entry; coordinate expense entry separately. |
| Report/invoice-field creation | [Normal Add entry resets draft](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/workspace/fields/WorkspaceFieldsSection.tsx#L275-L280), [reset contents](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/libs/actions/Policy/ReportField.ts#L127-L132) | Lossy despite drafting: guard abandonment or deliberately preserve normal re-entry. |
| Tax creation | [Unmount clears draft](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/workspace/taxes/WorkspaceCreateTaxPage.tsx#L40-L70) | Lossy: defer cleanup until confirmed abandonment. |
| Vacation delegate | [Back clears draft](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Profile/CustomStatus/VacationDelegateFormPage.tsx#L26-L34) | Lossy: protect delegate and date/time as one operation. |
| Personal expense-rule configuration | [Unmount clears form state](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Rules/RulePageBase.tsx#L93-L101) | Lossy: configuration is distinct from expense creation. |
| Theme, language, pronouns | [Theme updates on Save](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Preferences/ThemePage.tsx#L42-L65), [language](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Preferences/LanguagePage.tsx#L26-L66), [pronouns](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Profile/PronounsPage.tsx#L79-L91) | Local/lossy: not immediate-save settings toggles. |
| Sage Intacct credentials | [Non-drafted sensitive inputs](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/workspace/accounting/intacct/EnterSageIntacctCredentialsPage.tsx#L57-L90) | Local/lossy: guard rather than persist passwords. |
| Newsletter / mute switches | [Changes immediately invoke updates](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Preferences/PreferencesPage.tsx#L103-L125) | Autosaved: exclude these individual controls from additional prompting. |
| Expensify code | [Draft on input; focus clears errors, submit clears draft](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Subscription/ExpensifyCodePage/index.tsx#L50-L103), [normal entry only navigates](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/settings/Subscription/SubscriptionSettings/index.tsx#L144) | Resumable unsubmitted draft: ordinary-exit exception; failed submission retention needs a separate check. |
| Private notes | [Per-report drafting and restoration](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/pages/PrivateNotes/PrivateNotesEditPage.tsx#L67-L105) | Generally resumable; verify deletion-to-empty restoration and the debounce interval separately. |
| Schema-driven DynamicForm | [Drafted answers and memory-only sensitive answers](https://github.com/Expensify/App/blob/76a83b96be047b919ef886dff7d94ac9b65586e8/src/components/DynamicForm/index.tsx#L217-L243) | Mixed/unverified: audit each owning flow's cleanup and re-entry. No blanket exemption or blanket persistence. |

Other consumers remain unverified until their owning flow and ordinary re-entry are checked. This prioritized audit records remaining work, not a guarantee that every App form is now protected. Runtime verification of these remaining candidates is outside this six-form rollout.
