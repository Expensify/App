import Onyx from 'react-native-onyx';
import TranslationStore from '@src/languages/TranslationStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocaleListenerConnect} from './types';

/**
 * Adds event listener for changes to the locale. Callbacks are executed when the locale changes in Onyx.
 */
const connect: LocaleListenerConnect = (callbackAfterChange = () => {}) => {
    Onyx.connect({
        key: ONYXKEYS.ARE_TRANSLATIONS_LOADING,
        initWithStoredValues: false,
        callback: (val) => {
            if (val ?? true) {
                return;
            }

            const preferredLocale = TranslationStore.getCurrentLocale();
            if (!preferredLocale) {
                return;
            }
            callbackAfterChange(preferredLocale);
        },
    });
};

const BaseLocaleListener = {
    connect,
};

export default BaseLocaleListener;
