const YOUR_SPEND_ROW_STATE = {
    HIDDEN: 'hidden',
    LOADING: 'loading',
    READY: 'ready',
    HIDDEN_EMPTY: 'hiddenEmpty',
} as const;

/**
 * Discriminator for a card row's artwork branch:
 *   - `EXPENSIFY` keeps the existing Expensify Card icon.
 *   - `THIRD_PARTY` switches to bank artwork (employer feed) or a Plaid institution icon.
 */
const YOUR_SPEND_CARD_KIND = {
    EXPENSIFY: 'expensify',
    THIRD_PARTY: 'thirdParty',
} as const;

export {YOUR_SPEND_ROW_STATE, YOUR_SPEND_CARD_KIND};
