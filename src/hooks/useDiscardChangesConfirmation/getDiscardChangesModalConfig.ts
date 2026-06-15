import type {LocaleContextProps} from '@components/LocaleContextProvider';

/**
 * Shared config for the "Discard changes?" confirmation modal so the nav-away (`useDiscardChangesConfirmation`)
 * and tab-switch (`OnyxTabNavigator`) paths show the exact same modal. Web callers add the web-only
 * `shouldIgnoreBackHandlerDuringTransition` themselves.
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
