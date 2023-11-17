import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import compose from '@libs/compose';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LocaleContextProps} from './LocaleContextProvider';
import Picker from './Picker';
import type {PickerSize} from './Picker/types';
import withLocalize from './withLocalize';

type LocalePickerOnyxProps = {
    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<ValueOf<typeof CONST.LOCALES>>;
};

type LocalePickerProps = LocaleContextProps &
    LocalePickerOnyxProps & {
        /** Indicates size of a picker component and whether to render the label or not */
        size?: PickerSize;
    };

function LocalePicker({preferredLocale = CONST.LOCALES.DEFAULT, size = 'normal', translate}: LocalePickerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
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

                App.setLocale(locale as ValueOf<typeof CONST.LOCALES>);
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

export default compose(
    // TODO: think how this can be fixed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    withLocalize,
    withOnyx<LocalePickerProps, LocalePickerOnyxProps>({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(LocalePicker);
