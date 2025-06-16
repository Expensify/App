import React from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {setLocale} from '@userActions/App';
import {LOCALE_TO_LANGUAGE_STRING, SORTED_LOCALES} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import Picker from './Picker';
import type {PickerSize} from './Picker/types';

type LocalePickerProps = {
    /** Indicates size of a picker component and whether to render the label or not */
    size?: PickerSize;
};

function LocalePicker({size = 'normal'}: LocalePickerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const localesToLanguages = SORTED_LOCALES.map((locale) => ({
        value: locale,
        label: LOCALE_TO_LANGUAGE_STRING[locale],
        keyForList: locale,
        isSelected: preferredLocale === locale,
    }));
    const shouldDisablePicker = AccountUtils.isValidateCodeFormSubmitting(account);

    return (
        <Picker
            label={size === 'normal' ? translate('language') : null}
            onInputChange={(locale) => {
                if (locale === preferredLocale) {
                    return;
                }

                setLocale(locale);
            }}
            isDisabled={shouldDisablePicker}
            items={localesToLanguages}
            shouldAllowDisabledStyle={false}
            shouldShowOnlyTextWhenDisabled={false}
            size={size}
            value={preferredLocale}
            containerStyles={size === 'small' ? styles.pickerContainerSmall : {}}
            backgroundColor={theme.signInPage}
        />
    );
}

LocalePicker.displayName = 'LocalePicker';

export default LocalePicker;
