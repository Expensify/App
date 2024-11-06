import ONYXKEYS from '@src/ONYXKEYS';

const KEYS_TO_PRESERVE_DELEGATE_ACCESS = [
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.SESSION,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.CREDENTIALS,

    // We need to preserve the sidebar loaded state since we never unrender the sidebar when connecting as a delegate
    // This allows the report screen to load correctly when the delegate token expires and the delegate is returned to their original account.
    ONYXKEYS.IS_SIDEBAR_LOADED,
];

export {
    // eslint-disable-next-line import/prefer-default-export
    KEYS_TO_PRESERVE_DELEGATE_ACCESS,
};
