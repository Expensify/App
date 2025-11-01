# Internationalization Philosophy
This application is built with Internationalization (I18n) / Localization (L10n) support to provide a consistent experience across different languages and regions.

#### Related Philosophies
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)

#### Terminology
- **I18n** - Internationalization, the process of designing software to support multiple languages
- **L10n** - Localization, the process of adapting software for specific languages and regions
- **Translation Keys** - Unique identifiers for translatable strings
- **Locale** - A specific language and region combination (e.g., en-US, es-ES)

## Rules

### - All user-facing content MUST be localized
The following types of data MUST always be localized when presented to the user (including accessibility texts that are not rendered):

- **Texts**: Use the [translate method](https://github.com/Expensify/App/blob/655ba416d552d5c88e57977a6e0165fb7eb7ab58/src/libs/translate.js#L15)
- **Date/time**: Use [DateUtils](https://github.com/Expensify/App/blob/f579946fbfbdc62acc5bd281dc75cabb803d9af0/src/libs/DateUtils.js)
- **Numbers and amounts**: Use [NumberFormatUtils](https://github.com/Expensify/App/blob/55b2372d1344e3b61854139806a53f8a3d7c2b8b/src/libs/NumberFormatUtils.js) and [LocaleDigitUtils](https://github.com/Expensify/App/blob/55b2372d1344e3b61854139806a53f8a3d7c2b8b/src/libs/LocaleDigitUtils.js)
- **Phone numbers**: Use [LocalPhoneNumber](https://github.com/Expensify/App/blob/bdfbafe18ee2d60f766c697744f23fad64b62cad/src/libs/LocalePhoneNumber.js#L51-L52)

### - Components MUST use the `useLocalize` hook for translations
In most cases, you will need to localize data used in a component. Use the [useLocalize](https://github.com/Expensify/App/blob/4510fc76bbf5df699a2575bfb49a276af90f3ed7/src/hooks/useLocalize.ts) hook, which abstracts most of the logic you need (primarily subscribing to the [NVP_PREFERRED_LOCALE](https://github.com/Expensify/App/blob/6cf1a56df670a11bf61aa67eeb64c1f87161dea1/src/ONYXKEYS.js#L88) Onyx key).

### - Translations MUST be organized by feature and stored in language files
All translations are stored in language files in [src/languages](https://github.com/Expensify/App/tree/b114bc86ff38e3feca764e75b3f5bf4f60fcd6fe/src/languages). Translations SHOULD be grouped by their pages/components for better organization.

### - Common phrases SHOULD be shared when used in multiple places
A common rule of thumb is to move a common word/phrase to be shared when it's used in 3 or more places.

### - Complex translation strings MUST NOT be split up for formatting or value injection
Always prefer to use arrow functions and/or HTML to produce rich text in translation files. For example, if you need to generate the text `User has sent $20.00 to you on Oct 25th at 10:05am`, add just one key to the translation file and use the arrow function version:

```javascript
nameOfTheKey: ({amount, dateTime}) => `User has sent <strong>${amount}</strong> to you on <a>${datetime}</a>`,
```

This is because the order of phrases might vary from one language to another, and LLMs will be able to produce better translations will the full context of the phrase. If rich formatting is needed, use HTML in the string and render it with react-native-render-html.

### - String concatenation SHOULD NOT be used for translations
Always prefer whole phrases over string concatenation, even if the result is more verbose:

```ts
// BAD
{
    receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
        let message = 'Receipt required';
        if (formattedLimit ?? category) {
            message += ' over';
            if (formattedLimit) {
                message += ` ${formattedLimit}`;
            }
            if (category) {
                message += ' category limit';
            }
        }
        return message;
    },
    addExpenseApprovalsTask: ({workspaceMoreFeaturesLink}) =>
        `*Add expense approvals* to review your team's spend and keep it under control.\n` +
        '\n' +
        `Here's how:\n` +
        '\n' +
        '1. Go to *Workspaces*.\n' +
        '2. Select your workspace.\n' +
        '3. Click *More features*.\n' +
        '4. Enable *Workflows*.\n' +
        '5. Navigate to *Workflows* in the workspace editor.\n' +
        '6. Enable *Add approvals*.\n' +
        `7. You'll be set as the expense approver. You can change this to any admin once you invite your team.\n` +
        '\n' +
        `[Take me to more features](${workspaceMoreFeaturesLink}).`,
}

// GOOD
{
    receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
        if (formattedLimit && category) {
            return `Receipt required over ${formattedLimit} category limit`;
        }

        if (formattedLimit) {
            return `Receipt required over ${formattedLimit}`;
        }

        if (category) {
            return `Receipt required over category limit`;
        }

        return 'Receipt required';
    },
    addExpenseApprovalsTask: ({workspaceMoreFeaturesLink}) =>
        dedent(`
            *Add expense approvals* to review your team's spend and keep it under control.

            Here's how:

            1. Go to *Workspaces*.
            2. Select your workspace.
            3. Click *More features*.
            4. Enable *Workflows*.
            5. Navigate to *Workflows* in the workspace editor.
            6. Enable *Add approvals*.
            7. You'll be set as the expense approver. You can change this to any admin once you invite your team.

            [Take me to more features](${workspaceMoreFeaturesLink}).
        `),
    },
}

```

This provides our AI translation LLM with more context to translate the whole phrase as one string, producing higher quality results.

### - Plural forms MUST be handled correctly using plural translation objects
When working with translations that involve plural forms, it's important to handle different cases correctly:

- **zero**: Used when there are no items **(optional)**
- **one**: Used when there's exactly one item
- **two**: Used when there's two items **(optional)**
- **few**: Used for a small number of items **(optional)**
- **many**: Used for larger quantities **(optional)**
- **other**: A catch-all case for other counts or variations

Example implementation:
```javascript
messages: () => ({
    zero: 'No messages',
    one: 'One message',
    two: 'Two messages',
    few: (count) => `${count} messages`,
    many: (count) => `You have ${count} messages`,
    other: (count) => `You have ${count} unread messages`,
})
```

Usage in code:
```javascript
translate('common.messages', {count: 1});
```

## Translation Generation

### - `src/languages/en.ts` MUST be the source of truth for static strings
`src/languages/en.ts` is the source of truth for static strings in the App. `src/languages/es.ts` is (for now) manually-curated. The remainder are AI-generated using `scripts/generateTranslations.ts`.

### - Translation script SHOULD be used for generating non-English translations
The script is run automatically in GH and a diff with the translations is posted as a comment. See example: https://github.com/Expensify/App/pull/70702#issuecomment-3312988591

### - Translation quality SHOULD be improved through context and prompt refinement
If you are unhappy with the results of an AI translation, there are two methods of recourse:

1. **Context annotations**: If you are adding a string that can have an ambiguous meaning without proper context, you can add a context annotation in `en.ts`. This takes the form of a comment before your string starting with `@context`.

2. **Prompt adjustment**: The base prompt(s) can be found in `prompts/translation`, and can be adjusted if necessary.
