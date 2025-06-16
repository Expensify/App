import React, {useRef} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {setLocaleAndNavigate} from '@userActions/App';
import type {ListItem} from '@src/components/SelectionList/types';
import {LOCALE_TO_LANGUAGE_STRING, SORTED_LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/types/onyx/Locale';

type LanguageEntry = ListItem & {
    value: Locale;
};

function LanguagePage() {
    const {translate, preferredLocale} = useLocalize();
    const isOptionSelected = useRef(false);

    const localesToLanguages = SORTED_LOCALES.map((locale) => ({
        value: locale,
        text: LOCALE_TO_LANGUAGE_STRING[locale],
        keyForList: locale,
        isSelected: preferredLocale === locale,
    }));

    const updateLanguage = (selectedLanguage: LanguageEntry) => {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        setLocaleAndNavigate(selectedLanguage.value);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={LanguagePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('languagePage.language')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList
                sections={[{data: localesToLanguages}]}
                ListItem={RadioListItem}
                onSelectRow={updateLanguage}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={localesToLanguages.find((locale) => locale.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

LanguagePage.displayName = 'LanguagePage';

export default LanguagePage;
