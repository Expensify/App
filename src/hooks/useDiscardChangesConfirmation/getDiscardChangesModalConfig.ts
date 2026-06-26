import type {LocaleContextProps} from '@components/LocaleContextProvider';

/**
 * Single source of truth for the "Discard changes?" modal content, so every caller (nav-away and tab-switch)
 * renders an identical modal instead of drifting apart. Behavioral flags like the web-only
 * `shouldIgnoreBackHandlerDuringTransition` are added per caller, not here
 */
function getDiscardChangesModalConfig(translate: LocaleContextProps['translate']) {
    return {
        title: translate('discardChangesConfirmation.title'),
        prompt: translate('discardChangesConfirmation.body'),
        danger: true,
        confirmText: translate('discardChangesConfirmation.confirmText'),
        cancelText: translate('common.cancel'),
    };
}

export default getDiscardChangesModalConfig;
