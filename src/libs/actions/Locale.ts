import Onyx from 'react-native-onyx';
import {getDevicePreferredLocale} from '@libs/Localize';
import DateLocaleStore from '@src/languages/DateLocaleStore';
import TranslationStore from '@src/languages/TranslationStore';
import ONYXKEYS from '@src/ONYXKEYS';

/* There are scenarios where locale is not loaded and we start to render UI which results in rendering translations keys instead of real translations.
 * E.g. when we transition from OldDot to NewDot during sign-out.
 * This function is used to ensure that the locale is loaded before we start to render UI. Once we load initial locale we can remove listener.
 */
function init() {
    const connection = Onyx.connect({
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        initWithStoredValues: true,
        callback: (locale) => {
            Onyx.disconnect(connection);
            TranslationStore.load(locale ?? getDevicePreferredLocale());
            DateLocaleStore.load(locale ?? getDevicePreferredLocale());
        },
    });
}

export default init;
