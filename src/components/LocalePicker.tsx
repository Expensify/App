import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale} from '@src/types/onyx';
import Picker from './Picker';
import type {PickerSize} from './Picker/types';

type LocalePickerOnyxProps = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<Locale>;
};

type LocalePickerProps = LocalePickerOnyxProps & {
    /** Indicates size of a picker component and whether to render the label or not */
    size?: PickerSize;
};

function LocalePicker({preferredLocale = CONST.LOCALES.DEFAULT, size = 'normal'}: LocalePickerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const localesToLanguages = CONST.LANGUAGES.map((language) => ({
        value: language,
        label: translate(`languagePage.languages.${language}.label`),
        keyForList: language,
        isSelected: preferredLocale === language,
    }));

    return (
        <Picker
            label={size === 'normal' ? translate('languagePage.language') : null}
            onInputChange={(locale) => {
                if (locale === preferredLocale) {
                    return;
                }

                App.setLocale(locale);
            }}
            items={localesToLanguages}
            size={size}
            value={preferredLocale}
            containerStyles={size === 'small' ? styles.pickerContainerSmall : {}}
            backgroundColor={theme.signInPage}
        />
    );
}

LocalePicker.displayName = 'LocalePicker';

export default withOnyx<LocalePickerProps, LocalePickerOnyxProps>({
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(LocalePicker);
