import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import compose from '@libs/compose';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Picker from './Picker';
import type {PickerSize} from './Picker/types';
import withLocalize from './withLocalize';

type LocalePickerOnyxProps = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<ValueOf<typeof CONST.LOCALES>>;
};

type LocalePickerProps = LocalePickerOnyxProps & {
    /** Indicates size of a picker component and whether to render the label or not */
    size?: PickerSize;

    /** Returns translated string for given locale and phrase */
    translate: (phrase: string, variables?: Record<string, string>) => string;
};

function LocalePicker({preferredLocale = CONST.LOCALES.DEFAULT, size = 'normal', translate}: LocalePickerProps) {
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
                if (locale === preferredLocale || typeof locale !== 'string') {
                    return;
                }

                App.setLocale(locale);
            }}
            items={localesToLanguages}
            size={size}
            value={preferredLocale}
            containerStyles={size === 'small' ? [styles.pickerContainerSmall] : []}
            backgroundColor={themeColors.signInPage}
        />
    );
}

LocalePicker.displayName = 'LocalePicker';

export default compose(
    withLocalize,
    withOnyx<LocalePickerProps, LocalePickerOnyxProps>({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LocalePicker);
