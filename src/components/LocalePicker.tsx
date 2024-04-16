import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Locale} from '@src/types/onyx';
import Picker from './Picker';
import type {PickerSize} from './Picker/types';

type LocalePickerOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<Locale>;
};

type LocalePickerProps = LocalePickerOnyxProps & {
    /** Indicates size of a picker component and whether to render the label or not */
    size?: PickerSize;
};

function LocalePicker({account, preferredLocale = CONST.LOCALES.DEFAULT, size = 'normal'}: LocalePickerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const localesToLanguages = CONST.LANGUAGES.map((language) => ({
        value: language,
        label: translate(`languagePage.languages.${language}.label`),
        keyForList: language,
        isSelected: preferredLocale === language,
    }));
    const shouldDisablePicker = AccountUtils.isValidateCodeFormSubmitting(account);

    return (
        <Picker
            label={size === 'normal' ? translate('languagePage.language') : null}
            onInputChange={(locale) => {
                if (locale === preferredLocale) {
                    return;
                }

                App.setLocale(locale);
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

export default withOnyx<LocalePickerProps, LocalePickerOnyxProps>({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(LocalePicker);
