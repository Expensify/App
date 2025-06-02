import React from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {setLocale} from '@userActions/App';
import CONST from '@src/CONST';
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
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [preferredLocale = CONST.LOCALES.DEFAULT] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});

    const {canUseStaticAiTranslations} = usePermissions();
    const localesToLanguages = CONST.LANGUAGES.filter((language) => ['en', 'es'].includes(language) || canUseStaticAiTranslations).map((language) => ({
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
