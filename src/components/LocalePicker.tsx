import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import variables from '@styles/variables';
import {setLocale} from '@userActions/App';
import {LOCALE_TO_LANGUAGE_STRING, SORTED_LOCALES} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import Icon from './Icon';
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
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const icons = useMemoizedLazyExpensifyIcons(['Globe']);

    const locales = useMemo(() => {
        const sortedLocales = SORTED_LOCALES;
        return sortedLocales.map((locale) => ({
            value: locale,
            label: LOCALE_TO_LANGUAGE_STRING[locale],
            keyForList: locale,
            isSelected: preferredLocale === locale,
        }));
    }, [preferredLocale]);

    const shouldDisablePicker = AccountUtils.isValidateCodeFormSubmitting(account);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon
                src={icons.Globe}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
                accessibilityLabel={translate('languagePage.language')}
            />
            <View style={styles.ml2}>
                <Picker
                    label={size === 'normal' ? translate('languagePage.language') : null}
                    accessibilityLabel={`${translate('common.select')} ${translate('languagePage.language')}`}
                    onInputChange={(locale) => setLocale(locale, preferredLocale)}
                    isDisabled={shouldDisablePicker}
                    items={locales}
                    shouldAllowDisabledStyle={false}
                    shouldShowOnlyTextWhenDisabled={false}
                    size={size}
                    value={preferredLocale}
                    containerStyles={size === 'small' ? styles.pickerContainerSmall : {}}
                    backgroundColor={theme.signInPage}
                />
            </View>
        </View>
    );
}

export default LocalePicker;
